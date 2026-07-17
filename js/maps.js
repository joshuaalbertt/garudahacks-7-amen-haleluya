import { esc } from './util.js';
import { S, U, zoneScore } from './state.js';
import { Z, CENTER, PILOT, HARD, band } from './data.js';

export const maps = { mini:null, full:null };

function leafletReady(cb){
  if(window.L) return cb();
  let n = 0;
  const t = setInterval(()=>{ n++;
    if(window.L){ clearInterval(t); cb(); }
    else if(n>60){ clearInterval(t); mapFallback(); }
  }, 100);
}
function mapFallback(){
  ['map-mini','map-full'].forEach(id=>{
    const el = document.getElementById(id);
    if(el && !el._done) el.innerHTML = '<div class="map-fallback"><b style="font-size:13px">Peta tidak dapat dimuat</b><span class="serif" style="font-size:12px;color:var(--teks2)">Periksa koneksi internet lalu muat ulang.</span></div>';
  });
}
function nudge(map){
  [0,60,180,360,650].forEach(ms => setTimeout(()=>{ try{ if(map._container.isConnected) map.invalidateSize({animate:false}); }catch(e){} }, ms));
}
function initMap(kind){
  if(maps[kind] || !window.L) return;
  const el = document.getElementById(kind==='mini'?'map-mini':'map-full');
  if(!el || !el.isConnected || el.clientHeight<20 || el.clientWidth<20) return;
  el._done = true;
  const map = L.map(el, {
    zoomControl:false, attributionControl:false,
    center:CENTER, zoom: kind==='mini'?13:13.5,
    minZoom:11.5, maxZoom:17, zoomSnap:.5,
    scrollWheelZoom: kind==='full', preferCanvas:false,
    maxBounds: L.latLngBounds([HARD.s,HARD.w],[HARD.n,HARD.e]),
    maxBoundsViscosity:.7,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom:19, subdomains:'abcd' }).addTo(map);
  map._zones = buildZones(map, kind);
  map.on('moveend', ()=>{
    if(!map._container.isConnected) return;
    const out = !L.latLngBounds([PILOT.s,PILOT.w],[PILOT.n,PILOT.e]).contains(map.getCenter());
    const ov = document.getElementById(kind==='mini'?'out-mini':'out-full');
    if(ov) ov.classList.toggle('hidden', !out);
  });
  maps[kind] = map;
  nudge(map);
  if(window.ResizeObserver){
    new ResizeObserver(()=>{ try{ if(map._container.isConnected) map.invalidateSize({animate:false}); }catch(e){} }).observe(el);
  }
}
export function showMap(kind){
  leafletReady(()=>{
    let tries = 0;
    const attempt = ()=>{
      if(!maps[kind]) initMap(kind);
      if(maps[kind]){ nudge(maps[kind]); return; }
      if(tries++ < 40) setTimeout(attempt, 120);
    };
    attempt();
  });
}
export function buildZones(map, kind){
  const g = L.layerGroup();
  Z.forEach((z,i)=>{
    const score = zoneScore(z[0]), b = band(score);   // SELALU skor dinamis
    const cat = score>60?'tinggi':score>=30?'sedang':'rendah';
    const dim = kind==='full' && U.filter!=='semua' && U.filter!==cat;
    const sel = kind==='full' && U.selId===i;
    const op  = dim?0.08:1;
    L.circle([z[2],z[3]], {
      radius:380, color:sel?'#1B3A2D':b.c, weight:sel?3:1.5,
      opacity:.85*op, fillColor:b.c, fillOpacity:(sel?.42:.22)*op,
    }).on('click', ()=>{ if(!dim) window.A.tapZone(i, kind); }).addTo(g);
    if(!dim){
      const html = '<div class="zchip"><div class="n" style="background:'+(sel?'#1B3A2D':b.c)+'">'+score+'</div>'+
        (kind==='full'||score>60 ? '<div class="k">'+esc(z[0])+'</div>' : '')+'</div>';
      L.marker([z[2],z[3]], { icon:L.divIcon({className:'',html,iconSize:[10,10],iconAnchor:[5,5]}), interactive:false }).addTo(g);
    }
  });
  g.addTo(map);
  return g;
}
export function refreshZones(){
  Object.entries(maps).forEach(([kind,map])=>{
    if(!map || !map._container.isConnected) return;
    if(map._zones) map.removeLayer(map._zones);
    map._zones = buildZones(map, kind);
  });
}
export function destroyMaps(){
  Object.keys(maps).forEach(k=>{
    if(maps[k]){ try{ maps[k].remove(); }catch(e){} maps[k] = null; }
  });
  ['map-mini','map-full'].forEach(id=>{
    const el = document.getElementById(id);
    if(el){ el.innerHTML=''; el._done = false; }
  });
}

window.addEventListener('resize', ()=>{
  Object.values(maps).forEach(m=>{ if(m && m._container.isConnected){ try{ m.invalidateSize({animate:false}); }catch(e){} } });
});
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState==='visible' && S.user){
    if(U.tab==='beranda') showMap('mini');
    if(U.tab==='peta') showMap('full');
  }
});
