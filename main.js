/* eslint-disable prettier/prettier */
// canvas setup
const c = document.getElementById('canvas');
const x = c.getContext('2d');
const S = Math.sin, C = Math.cos, T = Math.tan, R = Math.random;
c.width = window.innerWidth;
c.height = window.innerHeight;
x.translate(c.width / 2, c.height / 2);
c.style.backgroundColor = 'black';

// touch setup
function touch2Mouse(e) {
  var theTouch = e.changedTouches[0];
  var mouseEv;
  switch (e.type) {
    case "touchstart":
      mouseEv = "mousedown";
      break;
    case "touchend":
      mouseEv = "mouseup";
      break;
    case "touchmove":
      mouseEv = "mousemove";
      break;
    default:
      return;
  }
  var mouseEvent = document.createEvent("MouseEvent");
  mouseEvent.initMouseEvent(
    mouseEv,
    true,
    true,
    window,
    1,
    theTouch.screenX,
    theTouch.screenY,
    theTouch.clientX,
    theTouch.clientY,
    false,
    false,
    false,
    false,
    0,
    null
  );
  theTouch.target.dispatchEvent(mouseEvent);
  e.preventDefault();
}
document.addEventListener("touchstart", touch2Mouse, true);
document.addEventListener("touchmove", touch2Mouse, true);
document.addEventListener("touchend", touch2Mouse, true);

const torus = (i, t, rotation = {x: 0, y: 0, z: 0}) => { // rotation { x, y, z}
    const u = i * 1;
    const v = i * 1;
    const r = .5;
    const R = 5;
    const x = (R + r * Math.cos(v*t)) * Math.cos(u);
    const y = (R + r * Math.cos(v+t)) * Math.sin(u);
    const z = r * Math.sin(v);
    // apply rotation
    let _x = x * C(rotation.x) - y * S(rotation.x);
    let _y = x * S(rotation.x) + y * C(rotation.x);
    let _z = z;
    return { x: _x, y: _y, z: _z };
}
function _3dto2d(cPos, cDi, cU, cF, cN, cFr, point) {
    const cR = {
        x: cU.y * cDi.z - cU.z * cDi.y,
        y: cU.z * cDi.x - cU.x * cDi.z,
        z: cU.x * cDi.y - cU.y * cDi.x
    };
    const cDw = {
        x: cDi.y * cR.z - cDi.z * cR.y,
        y: cDi.z * cR.x - cDi.x * cR.z,
        z: cDi.x * cR.y - cDi.y * cR.x
    };
    const p = {
        x: point.x - cPos.x,
        y: point.y - cPos.y,
        z: point.z - cPos.z
    };
    const pPr = {
        x: p.x * cDi.x + p.y * cDi.y + p.z * cDi.z,
        y: p.x * cR.x + p.y * cR.y + p.z * cR.z,
        z: p.x * cDw.x + p.y * cDw.y + p.z * cDw.z
    };
    if (pPr.z > cN && pPr.z < cFr) {
        const aspectRatio = 1;
        const fovFactor = Math.tan(cF * 0.5);
        const x = pPr.x / pPr.z * fovFactor * aspectRatio;
        const y = pPr.y / pPr.z * fovFactor;
        return { x, y };
    } else {
        return { x: 0, y: 0 };
    }
}
let rotation = { x: 0, y: 0, z: 0 };
function draw(c, x, C, S, T, R, t) {
    x.fillStyle = '#00000002';
    x.fillRect( -c.width, -c.height, c.width * 2, c.height * 2);
    for(let i = 0 ; i < 7e1; i=i+3) {
        let _t = torus(i, t, rotation);
        let p2 = _3dto2d(
            { x: -2, y: -15, z: -15 }, // camera position
            { x: 0, y: -.4, z: 1 }, // camera direction
            { x: 0, y: 1, z: 0 }, // camera up
            0.5, // camera field of view
            0.1, // camera near
            1000, // camera far
            _t
        );
        // the further away the point is, the more transparent it is
        x.fillStyle = 'hsl(' + (i*i) / ~~t*150 + ', 100%, 50%, 1)';
        x.fillRect(
            _t.x * 50, _t.y * 50 - 200, 2, 2
        );
    }
    requestAnimationFrame(() => draw(c, x, C, S, T, R, t + 1));
}
draw(c, x, C, S, T, R, 0);

window.addEventListener('resize', () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    x.translate(c.width / 2, c.height / 2);
});
// touch events rotate the camera
let touch = { x: 0, y: 0 };
let touchStart = { x: 0, y: 0 };
let touchEnd = { x: 0, y: 0 };
let touchMove = { x: 0, y: 0 };
let touchDown = false;

window.addEventListener('touchstart', (e) => {
    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  touchDown = true;
});

window.addEventListener('touchmove', (e) => {
    if(!touchDown) return;
    touchMove.x = e.touches[0].clientX;
    touchMove.y = e.touches[0].clientY;
    rotation.x += (touchMove.x - touchStart.x) * 0.001;
    rotation.z += (touchMove.y - touchStart.y) * 0.001;
    touchStart.x = touchMove.x;
    touchStart.y = touchMove.y;
    x.fillStyle = '#000000f1';
    x.fillRect( -c.width, -c.height, c.width * 2, c.height * 2);
});

window.addEventListener('touchend', (e) => {
    touchEnd.x = e.changedTouches[0].clientX;
    touchEnd.y = e.changedTouches[0].clientY;
    touchDown = false;
});

window.addEventListener('mousemove', (e) => {
    if(!touchDown) return;
    rotation.x += e.movementX * 0.001;
    rotation.z += e.movementY * 0.001;
    x.fillStyle = '#000000f1';
    x.fillRect( -c.width, -c.height, c.width * 2, c.height * 2);
});

window.addEventListener('mousedown', (e) => {
    touchStart.x = e.clientX;
    touchStart.y = e.clientY;
    touchDown = true;
});

window.addEventListener('mouseup', (e) => {
    touchEnd.x = e.clientX;
    touchEnd.y = e.clientY;
    touchDown = false;
});

window.addEventListener('wheel', (e) => {
    rotation.y += e.deltaY * 0.001;
});