"""Local, resumable OCR of user-supplied books into native app text. No PDF is bundled."""
import os
os.environ['OMP_THREAD_LIMIT'] = '1'
import argparse, concurrent.futures, io, json, queue, subprocess, sys, threading, time, unicodedata
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT/'.expo/ocr-python'))
from tesserocr import PyTessBaseAPI, PSM
sys.stdout.reconfigure(encoding='utf-8')
args = argparse.ArgumentParser()
args.add_argument('--workers', type=int, default=6)
args.add_argument('--source', type=Path, default=Path.home()/'Downloads')
options = args.parse_args()
books = json.loads((ROOT/'src/content/books.json').read_text(encoding='utf-8'))
checkpoint = ROOT/'.expo/ocr-pages'
output = ROOT/'src/content/bookTexts'
output.mkdir(parents=True, exist_ok=True)
# This supplied Internet Archive edition already contains a Tamil text layer.
# Preserve that text instead of adding a second round of recognition errors.
embedded = next(book for book in books if book['id']=='periyapuranam')
embedded_folder = checkpoint/embedded['id']
embedded_folder.mkdir(parents=True, exist_ok=True)
if not (embedded_folder/f"{embedded['pages']}.json").exists():
    document = pdfium.PdfDocument(options.source/embedded['originalFilename'])
    if len(document)!=embedded['pages']:raise ValueError('Embedded text page count mismatch')
    for number in range(1,len(document)+1):
        file = embedded_folder/f'{number}.json'
        if file.exists():continue
        original_page = document[number-1]
        text_page = original_page.get_textpage()
        text = unicodedata.normalize('NFC',text_page.get_text_range()).replace('\r','').strip()
        text_page.close()
        original_page.close()
        for symbol in ['\u200b','\u200c','\u200d','\u00ad']:text=text.replace(symbol,'')
        file.write_text(json.dumps({'number':number,'text':text,'confidence':None,'reviewed':False,'method':'embedded-text'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        if number%100==0:print(f'Copied existing text: {number}/{embedded["pages"]}',flush=True)
    document.close()
jobs = queue.Queue()
counts = {}
done = 0
failed = []
lock = threading.Lock()
start = time.time()
for book in sorted(books, key=lambda book: book['pages']):
    folder = checkpoint/book['id']
    folder.mkdir(parents=True, exist_ok=True)
    counts[book['id']] = 0
    for number in range(1, book['pages']+1):
        file = folder/f'{number}.json'
        if file.exists():
            try:json.loads(file.read_text(encoding='utf-8'))
            except (ValueError,OSError):file.unlink()
        if file.exists():
            done += 1
            counts[book['id']] += 1
        else:
            jobs.put((book, number))

def assemble(book):
    if counts[book['id']] != book['pages']:
        return
    pages = [json.loads((checkpoint/book['id']/f'{n}.json').read_text(encoding='utf-8')) for n in range(1,book['pages']+1)]
    method = 'embedded-text' if book['id']=='periyapuranam' else 'local-ocr'
    payload = {'id':book['id'], 'title':book['title'], 'sourcePages':book['pages'], 'method':method, 'reviewStatus':'unreviewed', 'pages':pages}
    (output/f"{book['id']}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')

def progress():
    state = {'done':done, 'total':sum(book['pages'] for book in books), 'failed':len(failed), 'seconds':round(time.time()-start), 'remaining':jobs.qsize()}
    (ROOT/'.expo/ocr-progress.json').write_text(json.dumps(state,indent=2),encoding='utf-8')
    print(json.dumps(state),flush=True)

def work(slot):
    global done
    api = None
    language = None
    try:
        while True:
            try: book, number = jobs.get_nowait()
            except queue.Empty: break
            try:
                required = 'tam+san+eng' if book['id']=='sudarsana-satakam' else 'tam'
                if language != required:
                    if api: api.End()
                    api = PyTessBaseAPI(path=str(ROOT/'.expo/ocr-models'),lang=required,psm=PSM.AUTO)
                    api.SetVariable('debug_file','NUL')
                    language = required
                result = subprocess.run(['pdftoppm','-f',str(number),'-l',str(number),'-singlefile','-r','200','-gray','-png',str(options.source/book['originalFilename'])],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
                image = Image.open(io.BytesIO(result.stdout)).convert('L')
                background = image.filter(ImageFilter.GaussianBlur(30))
                normalized = np.uint8(np.clip(np.asarray(image,dtype=float)/(np.asarray(background,dtype=float)+1)*255,0,255))
                api.SetImage(Image.fromarray(normalized))
                api.SetSourceResolution(200)
                text = unicodedata.normalize('NFC',api.GetUTF8Text()).replace('\r','')
                for symbol in ['\u200b','\u200c','\u200d','\u00ad']: text=text.replace(symbol,'')
                payload = {'number':number,'text':text.strip(),'confidence':api.MeanTextConf(),'reviewed':False}
                (checkpoint/book['id']/f'{number}.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
                with lock:
                    done += 1
                    counts[book['id']] += 1
                    if counts[book['id']]==book['pages']:
                        assemble(book)
                        print(f"Complete: {book['id']} ({book['pages']} pages)",flush=True)
                    if done%25==0:progress()
            except Exception as error:
                with lock:
                    failed.append({'id':book['id'],'page':number,'error':str(error)})
                    print(json.dumps(failed[-1]),flush=True)
            finally:jobs.task_done()
    finally:
        if api:api.End()

for book in books:assemble(book)
progress()
with concurrent.futures.ThreadPoolExecutor(max_workers=options.workers) as pool:
    list(pool.map(work,range(options.workers)))
progress()
(ROOT/'.expo/ocr-failures.json').write_text(json.dumps(failed,ensure_ascii=False,indent=2),encoding='utf-8')
if failed:sys.exit(1)
