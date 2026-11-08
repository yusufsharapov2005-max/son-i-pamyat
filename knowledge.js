(function(){
'use strict';
const questions=[
 {title:'Удержать информацию',text:'Тебе назвали четыре цифры, и ты сразу повторил их в том же порядке. Какой процесс показывает этот пример?',options:['Кратковременное удержание','Сохранение знаний на годы','Определение стадий сна'],correct:0,explanation:'Нужно ненадолго сохранить только что услышанное. Пример не измеряет память посетителя: здесь выбирают объяснение задания.',ref:1},
 {title:'Работать с информацией',text:'При вычислении 24 + 18 в уме нужно удерживать числа и промежуточный результат. Какое понятие подходит?',options:['Только длительность сна','Рабочая память','Ночное пробуждение'],correct:1,explanation:'Рабочая память объединяет хранение информации и действия с ней. Поэтому вычисление отличается от простого повторения числа.',ref:1},
 {title:'Сохранить изученное',text:'Вечером ты выучил правило, а утром вспоминаешь его. Какое объяснение связи со сном корректно?',options:['Сон заменяет изучение правила','Память во сне полностью отключается','Сон участвует в закреплении полученной информации'],correct:2,explanation:'Закрепление информации называют консолидацией памяти. Оно отличается от немедленного повторения. Это не обещание одинакового результата у всех.',ref:4},
 {title:'Понять исследование',text:'В публикации сопоставили анкеты о сне со средними оценками школьников. Что именно изучали?',options:['Связь особенностей сна с успеваемостью','Количество цифр, которое каждый запомнил','Эффект использования нашего сайта'],correct:0,explanation:'Оценка за четверть и результат воспроизведения цифр — разные показатели. Авторы этой статьи использовали анкеты о сне и сведения об успеваемости, а не наш планировщик.',ref:2},
 {title:'Сделать обоснованный вывод',text:'После изменения плана на сон выделено на 1 час 45 минут больше. Какой вывод позволяет сделать калькулятор?',options:['Память улучшится на известный процент','Изменился запас времени; результат памяти не измерен','На контрольной обязательно будет пятёрка'],correct:1,explanation:'Расчёт показывает временной промежуток. Для вывода об изменении памяти потребовались бы отдельные измерения. Планировщик их не проводит.',ref:4}
];
if(typeof module!=='undefined'&&module.exports)module.exports={questions};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);let index=0,answers=Array(questions.length).fill(null);
function render(){
 const q=questions[index];$('knowledge-progress').textContent=`Вопрос ${index+1} из ${questions.length}`;$('knowledge-title').textContent=q.title;$('knowledge-question').textContent=q.text;
 const field=$('knowledge-options');field.replaceChildren();
 q.options.forEach((option,i)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='radio';input.name='knowledge-option';input.value=String(i);input.checked=answers[index]===i;input.disabled=answers[index]!==null;label.append(input,document.createTextNode(option));field.append(label);});
 $('knowledge-check').hidden=answers[index]!==null;$('knowledge-next').hidden=answers[index]===null;$('knowledge-next').textContent=index===questions.length-1?'Посмотреть итог':'Следующий вопрос';$('knowledge-feedback').replaceChildren();
 if(answers[index]!==null)feedback();
}
function feedback(){const q=questions[index],host=$('knowledge-feedback');host.replaceChildren();const p=document.createElement('p');p.textContent=(answers[index]===q.correct?'Верно. ':'Разберём ответ. Правильно: '+q.options[q.correct]+'. ')+q.explanation;const link=document.createElement('a');link.href='#source-'+q.ref;link.textContent='Основание: источник ['+q.ref+']';host.append(p,link);}
$('knowledge-check').addEventListener('click',()=>{const chosen=document.querySelector('[name="knowledge-option"]:checked');if(!chosen){$('knowledge-feedback').textContent='Сначала выбери один ответ.';return;}if(answers[index]!==null)return;answers[index]=Number(chosen.value);render();});
$('knowledge-next').addEventListener('click',()=>{
 if(index<questions.length-1){index++;render();$('knowledge-title').focus();return;}
 $('knowledge-card').hidden=true;$('knowledge-result').hidden=false;const count=answers.filter((a,i)=>a===questions[i].correct).length;$('knowledge-score').textContent=`Верных ответов: ${count} из ${questions.length}.`;
 const missed=questions.filter((q,i)=>answers[i]!==q.correct).map(q=>q.title);$('knowledge-review').textContent=missed.length?'Можно повторить: '+missed.join('; ')+'. Объяснения всех вопросов включены в скачиваемый материал.':'Все ответы верны. Можно сохранить объяснения для повторения.';$('knowledge-score').focus();
});
$('knowledge-restart').addEventListener('click',()=>{index=0;answers=Array(questions.length).fill(null);$('knowledge-result').hidden=true;$('knowledge-card').hidden=false;render();$('knowledge-title').focus();});
function exportText(){return 'СОН И ПАМЯТЬ — МАТЕРИАЛ ДЛЯ ПОВТОРЕНИЯ\n\nЭто учебные вопросы по материалу сайта. Ответы не являются показателем памяти, здоровья или изменения привычек.\n\n'+questions.map((q,i)=>`${i+1}. ${q.text}\nМой ответ: ${answers[i]===null?'ещё не выбран':q.options[answers[i]]}\nПравильный ответ: ${q.options[q.correct]}\n${q.explanation}\nИсточник [${q.ref}] — см. ссылки ниже.\n`).join('\n')+'\nКАК ЧИТАТЬ ИССЛЕДОВАНИЕ\nВыясни, что измеряли: сон, оценку за четверть или воспроизведение цифр. Сопоставление показателей не заменяет эксперимент.\n\nИСТОЧНИКИ\n[1] https://doi.org/10.11621/npj.2016.0202\n[2] https://www.mediasphera.ru/issues/zhurnal-nevrologii-i-psikhiatrii-im-s-s-korsakova-2/2017/11-2/1199772982017112092\n[3] https://irzar.ru/storage/2023/10/124.pdf\n[4] https://umedp.ru/articles/son_i_kognitivnye_funktsii.html\n';}
window.knowledgeExport=()=> '\n'+exportText();
$('download-knowledge').addEventListener('click',()=>{const blob=new Blob(['\ufeff'+exportText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Сон_и_память_что_я_узнал.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);});
render();
})();
