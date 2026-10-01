async function loadD1Storage(){
 const r=await fetch("/api/admin/storage"); const x=await r.json();
 const used=(x.db_bytes||0), limit=x.limit_bytes||10737418240;
 const pct=Math.min(100,used/limit*100);
 const el=document.querySelector("#d1-storage");
 if(el) el.innerHTML=`<div style="font-weight:800">پر شدن D1: ${pct.toFixed(2)}%</div>
 <div style="height:12px;background:#203650;border-radius:9px;overflow:hidden;margin:8px 0">
 <div style="height:100%;width:${pct}%;background:#39d98a"></div></div>
 <small>${(used/1048576).toFixed(1)} MB از ${(limit/1073741824).toFixed(0)} GB</small>`;
}
