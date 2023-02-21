'use strict';

var chunkAFESC33Z_cjs = require('./chunk-AFESC33Z.cjs');
var r = require('react');

function m(c,e){return c===e}function j(c,e,n,a){let T=e instanceof chunkAFESC33Z_cjs.a?c:e,t=e instanceof chunkAFESC33Z_cjs.a?n:e,s=e instanceof chunkAFESC33Z_cjs.a?"":c,P=e instanceof chunkAFESC33Z_cjs.a?n:a,[l,f]=r.useState(T(t instanceof chunkAFESC33Z_cjs.a?t.getProps():t.getProps(s))),u=r.useRef(l),S=r.useCallback(T,[]),d=r.useCallback(P.comparator??m,[]);return r.useEffect(()=>{let p;function y(b){let i=S(b);d(u.current,i)&&f(i);}return t instanceof chunkAFESC33Z_cjs.a?p=t.suscribe(y):p=t.suscribe(s,y),()=>{p();}},[d,t,s,S]),l}

exports.a = j;
