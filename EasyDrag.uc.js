// ==UserScript==
// @name               EasyDrag.uc.js
// @namespace          EasyDrag@gmail.com
// @description        从紫云飞大大博客定制的自用拖拽，请到55行自行设置图片保存路径
// ==/UserScript==
location == "chrome://browser/content/browser.xul" && (function(event) {
	var self = arguments.callee;
	if (!event) {
		["dragstart", "dragover", "drop"].forEach(function(type) {
			gBrowser.mPanelContainer.addEventListener(type, self, false);
		});
		window.addEventListener("unload", function() {
			["dragstart", "dragover", "drop"].forEach(function(type) {
				gBrowser.mPanelContainer.removeEventListener(type, self, false);
			});
		}, false);
		return;
	}
	switch (event.type) {
	case "dragstart":
		{
			self.startPoint = [event.screenX, event.screenY];
			self.sourceNode = event.target;
			event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);
			break;
		}
	case "dragover":
		{
			self.startPoint && (Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService).getCurrentSession().canDrop = true);
			break;
		}
	case "drop":
		{
			if (self.startPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
				event.preventDefault();
				event.stopPropagation();
				var [subX, subY] = [event.screenX - self.startPoint[0], event.screenY - self.startPoint[1]];
				var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
				var direction;
				if (distX > distY) direction = subX < 0 ? "L" : "R";
				else direction = subY < 0 ? "U" : "D";
				if (event.dataTransfer.types.contains("application/x-moz-file-promise-url")) {
					if (direction == "U") {
						//搜索相似图片(baidu)
						gBrowser.addTab('http://stu.baidu.com/i?rt=0&rn=10&ct=1&tn=baiduimage&objurl=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
						return;
					}
					if (direction == "D") {
						//搜索相似图片(Google)
						gBrowser.addTab('http://www.google.com/searchbyimage?image_url=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
						return;
					}
					if (direction == "L") {
						//下载图片(指定位置不弹窗)
						var path = "D:\\defpt\\Pictures";
						var uri = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(event.dataTransfer.getData("application/x-moz-file-promise-url"), null, null)
						var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
						file.initWithPath(path);
						file.append(getDefaultFileName(null, uri));
						internalSave(null, null, null, null, null, null, null, {
							file: file,
							uri: uri
						}, null, internalSave.length === 12 ? document : true, internalSave.length === 12 ? true : null, null);
						return;
					}
					if (direction == "R") {
						//新标签打开图片(前台)
						gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("application/x-moz-file-promise-url"));
						return;
					}
				} else if (event.dataTransfer.types.contains("text/x-moz-url")) {
					if (direction == "U"||direction == "R") {
						//新标签打开链接(后台)
						gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
						return;
					}
					if (direction == "D") {
						//新标签打开链接(前台)
						gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
						return;
					}
					if (direction == "L") {
						//IE打开当前链接
						var newurl=event.dataTransfer.getData("text/x-moz-url").split("\n")[0];
						try {
						     var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProgF", Components.interfaces.nsILocalFile);
						     file.append("Internet Explorer");
						     file.append("iexplore.exe");
						     var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
						     process.init(file);
						     process.run(false, [newurl], 1);
					    } catch (ex) {
						     alert("\u6253\u5f00IE\u5931\u8d25!")
					         }
						return;
					}
				} else {
					if (direction == "U") {
						//Google搜索选中文字(站内)(前台)
						gBrowser.selectedTab = gBrowser.addTab('http://www.google.com/search?q=' + "site:" + content.location.host + " " + encodeURIComponent(event.dataTransfer.getData("text/unicode")));
						return;
					}
					if (direction == "D") {
						//搜索框搜索选中文字(前台)
						gBrowser.selectedTab = gBrowser.addTab();
						BrowserSearch.loadSearch(event.dataTransfer.getData("text/unicode"), false);
						return;
					}
					if (direction == "L") {
						//打开查找栏搜索文本
						gFindBar._findField.value = event.dataTransfer.getData("text/unicode");
						gFindBar.open();
						gFindBar.toggleHighlight(1);
						return;
					}
					if (direction == "R") {
						//Google翻译文本
						var div = content.document.documentElement.appendChild(content.document.createElement("div"));
						div.style.cssText = "position:absolute;z-index:1000;border-left:solid 0.5px #0000AA;border-top:solid 1px #0000AA;border-right:solid 2.5px #0000AA;border-bottom:solid 2px #0000AA;background-color:white;padding-left:5px;padding: 1pt 3pt 1pt 3pt;font-size: 10pt;color: black;left:" + +(event.clientX + content.scrollX + 10) + 'px;top:' + +(event.clientY + content.scrollY + 10) + "px";
						var xmlhttp = new XMLHttpRequest;
						xmlhttp.open("get", "http://translate.google.cn/translate_a/t?client=t&hl=zh-CN&sl=auto&tl=zh-CN&text=" + event.dataTransfer.getData("text/unicode"), 0);
						xmlhttp.send();
						div.textContent = eval("(" + xmlhttp.responseText + ")")[0][0][0];
						content.addEventListener("click", function() {
							content.removeEventListener("click", arguments.callee, false);
							div.parentNode.removeChild(div);
						}, false);
						return;
					}
				}
				self.startPoint = 0;
			}
		}
	}
})()
