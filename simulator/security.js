/* Progress from browser storage or cloud rows is untrusted, non-authoritative data. */
(() => {
  'use strict';
  const tracks=['networking','sysadmin','cyber','cloud','integrated'];
  const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  function progress(value) {
    const v=object(value)?value:{};
    const completed={},completedLevels={};
    for(const track of tracks){
      if(object(v.completed)&&v.completed[track]===true)completed[track]=true;
      for(let level=1;level<=5;level++){const key=`${track}:${level}`;if(object(v.completedLevels)&&v.completedLevels[key]===true)completedLevels[key]=true;}
    }
    const xp=typeof v.xp==='number'&&Number.isFinite(v.xp)?Math.min(1000000,Math.max(0,Math.floor(v.xp))):0;
    return {completed,completedLevels,xp};
  }
  window.PrempehSecurity=Object.freeze({progress});
})();
