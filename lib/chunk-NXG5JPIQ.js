import { a } from './chunk-GVAC4HTR.js';
import r from 'react';

function m(c,e){return c===e}function j(c,e,n,a$1){let T=e instanceof a?c:e,t=e instanceof a?n:e,s=e instanceof a?"":c,P=e instanceof a?n:a$1,[l,f]=r.useState(T(t instanceof a?t.getProps():t.getProps(s))),u=r.useRef(l),S=r.useCallback(T,[]),d=r.useCallback(P.comparator??m,[]);return r.useEffect(()=>{let p;function y(b){let i=S(b);d(u.current,i)&&f(i);}return t instanceof a?p=t.suscribe(y):p=t.suscribe(s,y),()=>{p();}},[d,t,s,S]),l}

export { j as a };
