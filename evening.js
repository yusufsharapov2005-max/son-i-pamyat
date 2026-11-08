(function(){
'use strict';
function timeline(start,minutes,limit,order=[0,1,2,3]){
 if(!Number.isInteger(start)||start<0||start>=1440||!Array.isArray(minutes)||minutes.length!==4||minutes.some(n=>!Number.isInteger(n)||n<0||n>720)||!Number.isInteger(limit)||limit<0)throw new Error('Проверь время и длительность дел.');
 if(!Array.isArray(order)||order.length!==4||new Set(order).size!==4||order.some(i=>!Number.isInteger(i)||i<0||i>3))throw new Error('Проверь порядок дел.');
 let cursor=start;
 const names=['Домашние задания','Ужин и домашние дела','Отдых и другие занятия','Подготовка ко сну'];
 return order.map(i=>{const n=minutes[i];const row={index:i,name:names[i],start:cursor,end:cursor+n,late:cursor+n>start+limit,duration:n};cursor+=n;return row;}).filter(r=>r.duration>0);
}
if(typeof module!=='undefined'&&module.exports)module.exports={timeline};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),keys=['homework','dinner','rest','preparation'];
let order=[0,1,2,3];
const defaults=['Домашние задания','Ужин и домашние дела','Отдых и другие занятия','Подготовка ко сну'];
function drawOrder(){
 const host=$('task-order');host.replaceChildren();
 order.forEach((index,pos)=>{
  const key=keys[index],li=document.createElement('li'),input=document.createElement('input');input.id='name-'+key;input.maxLength=60;input.value=names[index];input.setAttribute('aria-label','Название блока '+(pos+1));input.addEventListener('input',()=>{names[index]=input.value;render();});li.append(input);
  for(const [delta,title] of [[-1,'Выше'],[1,'Ниже']]){const b=document.createElement('button');b.type='button';b.textContent=title;b.setAttribute('aria-label',title+': '+defaults[index]);b.disabled=pos+delta<0||pos+delta>=4;b.addEventListener('click',()=>{[order[pos],order[pos+delta]]=[order[pos+delta],order[pos]];drawOrder();render();$('name-'+key).focus();});li.append(b);}
  host.append(li);
 });
}
let names=[...defaults];drawOrder();
const numberTime=v=>Number(v.slice(0,2))*60+Number(v.slice(3));
const formatted=n=>SleepPlanner.clock(n)+(n>=1440?' (следующий день)':'');
function render(){
 const host=$('timeline-output');host.replaceChildren();
 keys.forEach((key,i)=>{document.querySelector('label[for="'+key+'"]').textContent=(names[i].trim()||defaults[i])+', минут';});
 try{
  const p=SleepPlanner.plan($('wake').value,$('grade').value,$('duration').value,$('latency').value);
  if(!/^\d{2}:\d{2}$/.test($('free-start').value)||keys.some(k=>$(k).value===''))throw Error();
  const start=numberTime($('free-start').value),rise=numberTime(p.wake),aligned=start>rise?start-1440:start,limit=rise-Math.round(p.duration*60)-p.latency-aligned;
  const rows=timeline(start,keys.map(k=>Number($(k).value)),limit,order);
  for(const row of rows){const li=document.createElement('li');li.className=row.late?'late':'';li.textContent=`${formatted(row.start)}–${formatted(row.end)} · ${names[row.index].trim()||defaults[row.index]}${row.late?' — выходит за время отбоя':''}`;host.append(li);}
  const total=rows.reduce((n,r)=>n+r.duration,0);
  const li=document.createElement('li');li.textContent=total<=limit?`До отбоя ${p.bed} остаётся ${SleepPlanner.durationLabel((limit-total)/60)} свободного времени.`:'Часть дел не помещается. Список показывает исходный план; программа не сокращает занятия автоматически.';host.append(li);
 }catch(e){host.textContent='Расписание не построено: проверь исходные значения и время начала вечера.';}
}
for(const key of ['wake','grade','duration','latency','free-start',...keys])for(const event of ['input','change'])$(key).addEventListener(event,render);
const examples={normal:{start:'18:00',tasks:[60,45,30,20]},busy:{start:'18:00',tasks:[300,45,30,20]},late:{start:'20:30',tasks:[90,30,30,20]}};
for(const button of document.querySelectorAll('[data-evening]'))button.addEventListener('click',()=>{
 const ex=examples[button.dataset.evening];$('wake').value='07:00';$('grade').value='middle';$('duration').value='9.5';$('latency').value='15';$('free-start').value=ex.start;keys.forEach((k,i)=>$(k).value=ex.tasks[i]);order=[0,1,2,3];names=[...defaults];drawOrder();
 $('grade').dispatchEvent(new Event('change',{bubbles:true}));$('duration').dispatchEvent(new Event('input',{bubbles:true}));window.updateEvening();render();$('scenario-status').textContent='Условный пример: '+button.textContent+'. Подъём 07:00; сон 9 ч 30 мин; засыпание 15 мин. Эти настройки можно изменить.';
});
render();
})();
