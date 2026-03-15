import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();
app.use(express.json({limit:'1mb'}));
app.use(express.static(__dirname));
const BASE=process.env.OPENROUTER_BASE_URL||'https://openrouter.ai/api/v1';
const MODEL=process.env.OPENROUTER_MODEL||'openrouter/auto';
app.post('/api/coach', async (req,res)=>{
  try{
    const key=process.env.OPENROUTER_API_KEY;
    if(!key) return res.status(500).json({error:'OPENROUTER_API_KEY missing'});
    const {target, stopped, streak, mode}=req.body||{};
    const prompt=`You are a coach for a gas station stop-at-target simulator.\nGiven target and stopped values, return:\n1) score explanation\n2) one tactical tip\n3) one challenge modifier for next round\n\nTarget: ${target}\nStopped: ${stopped}\nStreak: ${streak}\nMode: ${mode}`;
    const r=await fetch(`${BASE}/chat/completions`,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','HTTP-Referer':'https://www.sundai.club','X-Title':'Fuel Stop Challenge'},body:JSON.stringify({model:MODEL,messages:[{role:'user',content:prompt}]})});
    const t=await r.text();
    if(!r.ok) return res.status(502).json({error:`upstream ${r.status}: ${t.slice(0,220)}`});
    const d=JSON.parse(t);
    res.json({content:d?.choices?.[0]?.message?.content||''});
  }catch(e){res.status(500).json({error:e.message});}
});
app.listen(process.env.PORT||10000);
