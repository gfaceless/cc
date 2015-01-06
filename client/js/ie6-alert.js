var el = document.createElement('div');

// el.setAttribute('style', 'position:absolute;width:100%;height:100px;text-align:center;line-height:100px;top:0;left:0;background-color:#000;color:#fff;font-size:30px;');
el.style.position = "absolute";
el.style.width = "100%";
el.style.fontSize = "30px";
el.style.height = "110px";
el.style.textAlign = "center";
el.style.lineHeight = "55px";
el.style.backgroundColor = "#000";
el.style.color = "#fff";
el.style.top = "0";
el.style.left = "0";
el.style.zIndex = 100;


var ie6Str = "您的浏览器内核已经落后近15年，存在较大安全隐患，<br/>本站已不再支持该浏览器，请升级后再访问";
el.innerHTML = ie6Str;

document.body && document.body.appendChild(el);	
