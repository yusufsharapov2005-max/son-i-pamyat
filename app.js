(function(){
 'use strict';
 const $=id=>document.getElementById(id),api=window.SleepPlanner;
 const form=$('sleep-form'),wake=$('wake'),grade=$('grade'),duration=$('duration'),latency=$('latency');
 let current;
 const dayText=day=>day<0?'накануне подъёма':'в день подъёма';
 function update(animate){
  try{
   current=api.plan(wake.value,grade.value,duration.value,latency.value);
   $('form-error').hidden=true;$('result').hidden=false;$('download').disabled=false;
   $('duration-label').textContent=api.durationLabel(current.duration);
   $('bed-result').textContent=current.bed;$('bed-day').textContent=dayText(current.bedDay);
   $('sleep-result').textContent=current.sleep;$('wake-result').textContent=current.wake;
   const range=api.durationLabel(current.range.min)+'–'+api.durationLabel(current.range.max);
   const days=current.earliestDay===current.latestDay?' ('+dayText(current.earliestDay)+')':` (${dayText(current.earliestDay)} — ${dayText(current.latestDay)})`;
   $('window-result').textContent=`Для ${range} сна: лечь между ${current.earliest} и ${current.latest}${days}.`;
   $('window-result').textContent+=' '+(current.duration<current.range.min?'Выбрано меньше рекомендованного ориентира.':current.duration>current.range.max?'Выбрано больше рекомендованного ориентира.':'Выбранное время находится в рекомендованном диапазоне.'); if(window.updateEvening)window.updateEvening(); if(animate){$('result').classList.remove('updated');void $('result').offsetWidth;$('result').classList.add('updated');}
  }catch(error){current=null;$('form-error').textContent=error.message;$('form-error').hidden=false;$('result').hidden=true;$('download').disabled=true;}
 }
 grade.addEventListener('change',()=>{const g=api.groups[grade.value];duration.min=4;duration.max=12;$('duration-min').textContent='4 часа';$('duration-max').textContent='12 часов';$('duration-hint').replaceChildren(document.createTextNode(`Ориентир для ${g.label}: ${api.durationLabel(g.min)}–${api.durationLabel(g.max)}. Выбор длительности свободный. `));const ref=document.createElement('a');ref.href='#source-5';ref.className='ref';ref.textContent='[5]';$('duration-hint').append(ref);update(false);});
 [wake,duration,latency].forEach(el=>el.addEventListener('input',()=>update(false)));
 form.addEventListener('submit',event=>{event.preventDefault();update(true);});
 $('download').addEventListener('click',()=>{if(!current)return;const c=current;const text=`СОН И ПАМЯТЬ — МОЙ ПЛАН\n\nКласс: ${c.range.label}\nПодъём: ${c.wake}\nНа сон: ${api.durationLabel(c.duration)}\nЗапас на засыпание: ${c.latency} мин\nЛечь в постель: ${c.bed} (${dayText(c.bedDay)})\nПланируемое засыпание: ${c.sleep} (${dayText(c.sleepDay)})\n\nЭто расчёт расписания. Фактическое засыпание и ночные пробуждения могут изменить продолжительность сна. План не измеряет память.\n\nИсточник диапазонов: Роспотребнадзор, 27.09.2024.\nhttps://zpp.rospotrebnadzor.ru/news/federal/508970\n\nУчебный проект. Шарапов Ислам Максимович, 9 класс.\n`;const fullText=text+'\nПРОВЕРКА СВОЕГО РАСПИСАНИЯ\nЛожусь: '+$('actual-bed').value+'; встаю: '+$('actual-wake').value+'\n'+$('actual-result').textContent+'\n\nВЕЧЕРНИЙ ПЛАН\nНачало: '+$('free-start').value+'\n'+$('name-homework').value+': '+$('homework').value+' мин\nУжин и дела: '+$('dinner').value+' мин\nОтдых: '+$('rest').value+' мин\nПодготовка ко сну: '+$('preparation').value+' мин\n'+$('evening-result').textContent+'\n\nРАСПИСАНИЕ ПО ВРЕМЕНИ\n'+$('timeline-output').innerText+'\n'+(window.lessonExport?window.lessonExport():'')+(window.knowledgeExport?window.knowledgeExport():'');const blob=new Blob(['\ufeff'+fullText],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Мой_план_сна.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);});
 
 update(false);
})();

(function(){
const id=x=>document.getElementById(x),mins=x=>{const v=id(x).value;return /^\d{2}:\d{2}$/.test(v)?Number(v.slice(0,2))*60+Number(v.slice(3)):NaN;};
function refresh(){
const bed=mins('actual-bed'),wake=mins('actual-wake'),delay=Number(id('latency').value),g=SleepPlanner.groups[id('grade').value];
const available=((wake-bed+1440)%1440)-delay;
id('actual-result').textContent=!Number.isFinite(available)?'Укажи время отхода в постель и подъёма.':bed===wake?'Одинаковое время неоднозначно: выбери разные значения.':available<=0?'После вычета времени засыпания времени на сон не остаётся.':`На сон остаётся примерно ${SleepPlanner.durationLabel(available/60)}. `+(available<g.min*60?`Это ниже ориентира для ${g.label}.`:available>g.max*60?`Это выше ориентира для ${g.label}.`:'Это соответствует выбранному ориентиру.');
try{const p=SleepPlanner.plan(id('wake').value,id('grade').value,id('duration').value,id('latency').value);let sum=0;for(const key of ['homework','dinner','rest','preparation']){const value=id(key).value;const n=Number(value);if(value===''||!Number.isInteger(n)||n<0||n>720)throw Error();sum+=n;}const start=mins('free-start');if(!Number.isFinite(start))throw Error();const rise=mins('wake');let target=rise-Math.round(p.duration*60)-p.latency;const alignedStart=start>rise?start-1440:start;const windowMinutes=target-alignedStart;if(windowMinutes<0){id('evening-result').textContent='Время начала вечера оказалось позже запланированного отбоя. Проверь расписание.';return;}const balance=windowMinutes-sum;id('evening-result').textContent=`Дела займут ${SleepPlanner.durationLabel(sum/60)}. До отбоя в ${p.bed} доступно ${SleepPlanner.durationLabel(windowMinutes/60)}. `+(balance>=0?`Всё помещается; свободный запас — ${SleepPlanner.durationLabel(balance/60)}.`:`Не хватает ${SleepPlanner.durationLabel(-balance/60)}. Продумай, какие дела перенести на другое время. Перестановка блоков не меняет их общую длительность.`);}catch(e){id('evening-result').textContent='Заполни время и длительность дел целыми минутами от 0 до 720.';}
}
window.updateEvening=refresh;for(const key of ['actual-bed','actual-wake','free-start','homework','dinner','rest','preparation','grade','wake','duration','latency'])id(key).addEventListener('input',refresh);id('grade').addEventListener('change',refresh);refresh();
})();
