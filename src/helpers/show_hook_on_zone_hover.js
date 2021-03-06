
const showHookOnZoneHover = (hookNode, zoneNode) => {
  zoneNode.onmouseover = () => {
    hookNode.style.opacity = 1;
  };
  zoneNode.onmouseout = () => {
    hookNode.style.opacity = 0;
  };
};


// Hide the hook by default, and show it when the user hovers `zoneNodes`.
export default (hookNode, zoneNodes) => {
  hookNode.style.opacity = 0;
  if (zoneNodes.forEach) {
    zoneNodes.forEach(zoneNode => showHookOnZoneHover(hookNode, zoneNode));
  } else {
    showHookOnZoneHover(hookNode, zoneNodes);
  }
};
