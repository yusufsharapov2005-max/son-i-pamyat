(function(root){
  'use strict';
  const groups={junior:{min:10,max:10.5,label:'1–4 классов'},middle:{min:9,max:10,label:'5–9 классов'},senior:{min:8,max:9,label:'10–11 классов'}};
  function clock(minutes){const normalized=((minutes%1440)+1440)%1440;return String(Math.floor(normalized/60)).padStart(2,'0')+':'+String(normalized%60).padStart(2,'0');}
  function durationLabel(hours){const minutes=Math.round(hours*60);return minutes<60?minutes+' мин':Math.floor(minutes/60)+' ч'+(minutes%60?' '+minutes%60+' мин':'');}
  function plan(wake,group,duration,latency){
    if(typeof wake!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(wake))throw new Error('Выберите корректное время подъёма.');
    const g=groups[group];if(!g)throw new Error('Выберите класс.');
    const target=Number(duration),delay=Number(latency);
    if(!Number.isFinite(target)||target<4||target>12)throw new Error('Выберите продолжительность сна в указанном диапазоне.');
    if(![0,15,30,45,60].includes(delay))throw new Error('Выберите время на засыпание.');
    const [hh,mm]=wake.split(':').map(Number),rise=hh*60+mm;
    const sleep=rise-Math.round(target*60),bed=sleep-delay;
    const earliest=rise-Math.round(g.max*60)-delay,latest=rise-Math.round(g.min*60)-delay;
    return {wake,group,duration:target,latency:delay,bed:clock(bed),sleep:clock(sleep),bedDay:Math.floor(bed/1440),sleepDay:Math.floor(sleep/1440),earliest:clock(earliest),latest:clock(latest),earliestDay:Math.floor(earliest/1440),latestDay:Math.floor(latest/1440),range:g};
  }
  const api={groups,clock,durationLabel,plan};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.SleepPlanner=api;
})(typeof window!=='undefined'?window:globalThis);
