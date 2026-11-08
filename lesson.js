(function(){
'use strict';
function compare(bed,wake,latency,planned){
 const read=s=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))throw Error();return Number(s.slice(0,2))*60+Number(s.slice(3));};
 const b=read(bed),w=read(wake),n=Number(latency),p=Number(planned);
 if(b===w||!Number.isFinite(n)||n<0||n>60||!Number.isFinite(p)||p<4||p>12)throw Error();
 const before=(w-b+1440)%1440-n;if(before<=0)throw Error();
 return {before,after:Math.round(p*60),difference:Math.round(p*60)-before};
}
if(typeof module!=='undefined'&&module.exports)module.exports={compare};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),label=n=>SleepPlanner.durationLabel(n/60);
function render(){
 try{
  const c=compare($('actual-bed').value,$('actual-wake').value,$('latency').value,$('duration').value);
  const p=SleepPlanner.plan($('wake').value,$('grade').value,$('duration').value,$('latency').value);
  $('lesson-before').textContent=`В постели с ${$('actual-bed').value}, подъём ${$('actual-wake').value}, засыпание ${p.latency} мин. На сон — примерно ${label(c.before)}.`;
  $('lesson-after').textContent=`В постели с ${p.bed}, подъём ${p.wake}, засыпание ${p.latency} мин. На сон выделено ${label(c.after)}.`;
  $('lesson-difference').textContent=c.difference===0?'В обоих расписаниях одинаковое время сна.':`В выбранном плане на сон ${c.difference>0?'больше':'меньше'} времени на ${label(Math.abs(c.difference))}.`;
 }catch(e){$('lesson-before').textContent='Проверь исходное время сна и подъёма.';$('lesson-after').textContent='Проверь выбранный план.';$('lesson-difference').textContent='Сравнение не построено: нужны корректные значения.';}
}
for(const id of ['actual-bed','actual-wake','wake','grade','latency','duration'])for(const e of ['input','change'])$(id).addEventListener(e,render);
document.querySelectorAll('[name="lesson-answer"]').forEach(el=>el.addEventListener('change',()=>{
 $('lesson-feedback').textContent=el.value==='time'?'Верно. Мы вычислили разницу во времени. Сон участвует в закреплении знаний, но эта форма не измеряет память и не рассчитывает оценку. Основание объяснения — источник [4].':'Такой вывод не следует из расчёта. Мы сравнили время, а память и успеваемость не измеряли. Более ранний отбой сам по себе не гарантирует определённый результат. Вернись к первому варианту.';
}));
$('load-lesson').addEventListener('click',()=>{
 document.querySelector('[data-evening="normal"]').click();$('actual-bed').value='23:00';$('actual-wake').value='07:00';$('actual-bed').dispatchEvent(new Event('input',{bubbles:true}));
 document.querySelectorAll('[name="lesson-answer"]').forEach(e=>e.checked=false);$('lesson-feedback').textContent='Выбери вывод и прочитай объяснение. Это учебный вопрос без сбора ответов и оценки памяти.';render();
});
for(const id of ['download-lesson','download-evening'])$(id).addEventListener('click',()=>$('download').click());
window.lessonExport=()=>`\nУЧЕБНЫЙ РАЗБОР: ВЕЧЕР ПЕРЕД КОНТРОЛЬНОЙ\n${$('lesson-before').textContent}\n${$('lesson-after').textContent}\n${$('lesson-difference').textContent}\nОбъяснение: сон участвует в закреплении знаний; часы не позволяют предсказать оценку или процент изменения памяти.\nИсточник: https://umedp.ru/articles/son_i_kognitivnye_funktsii.html\n${$('lesson-feedback').textContent}\nМоё решение: ${$('lesson-note').value.trim()||'не записано'}\n`;
render();
})();
