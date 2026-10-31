// Erzeugt die PNG-Icons der Studio-App aus icon.svg (Logo „Horizont“, Nacht).
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const dir=process.argv[2]||'/home/claude/studio-app';
const svg=fs.readFileSync(path.join(dir,'icon.svg'),'utf8');
const eckig=s=>s.replace(/(<rect id="bg"[^>]*?) rx="22"/,'$1');
const maskable=s=>eckig(s).replace('<g id="motiv">','<g id="motiv" transform="translate(10 10) scale(.8)">');
(async()=>{const b=await chromium.launch();
for(const [n,s,form] of [['icon-180.png',180,'eckig'],['icon-192.png',192,'rund'],['icon-512.png',512,'rund'],['icon-maskable-512.png',512,'maskable'],['favicon-32.png',32,'rund']]){
 const inner=form==='eckig'?eckig(svg):form==='maskable'?maskable(svg):svg;
 const p=await b.newPage({viewport:{width:s,height:s}});
 await p.setContent(`<html><body style="margin:0;background:transparent">${inner.replace('<svg ','<svg width="'+s+'" height="'+s+'" ')}</body></html>`);
 await p.screenshot({path:path.join(dir,n),omitBackground:true});await p.close()}
await b.close()})();
