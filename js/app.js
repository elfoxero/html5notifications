// <!--
	'use strict';
	
	if ((!window.Notification && !navigator.mozNotification) || !window.FileReader || !window.history.pushState) {
		$("#msgUnsupported").show();
		$("input[name='permission']").attr("disabled", true);	
	}

	if ("mozNotification" in navigator) {
		window.Notification = {
			"permission": "granted"
		};
	}

	$("*[data-init-lang]").each(function (index, elem) {
		$(elem).text(_($(elem).data("lang"), true));
	});

	if (curLang === "es") {
		$("#langEs").parent().addClass("active");
	} else {
		$("#langEn").parent().addClass("active");
	}

	var Handler = {
		checkPermission: function () {
			if ("mozNotification" in navigator) {
				$("#frmMain > .row:first-child").hide()
				Handler.enable(true);
			} else {
				Notification.requestPermission(function (permission) {
					if (permission === "granted") {
						Handler.enable(true);
					}
				});
			}
		},
		displayNotification: function (title, message, icon, delay, onclick) {
			var instance;
			
			if (title.length > 0) {
				var attributes = {};
				
				delay = Math.max(0, Math.min(60, delay));
				
				if (message.length > 0) {
					attributes.body = message.substr(0, 250);
				}
				
				if (icon.length > 0) {
					attributes.icon = icon;
				}
				
				if ("mozNotification" in navigator) {
					if (delay > 0) {
						window.setTimeout(function () {
							instance = navigator.mozNotification.createNotification(title.substr(0, 100), attributes.body || '', attributes.icon || null);
							
							if (onclick !== undefined) {
								instance.onclick = onclick;
							}

							instance.show();
						}, delay * 1000);
					} else {
						instance = navigator.mozNotification.createNotification(title.substr(0, 100), attributes.body || '', attributes.icon || null);
						
						if (onclick !== undefined) {
							instance.onclick = onclick;
						}

						instance.show();
					}
				} else {
					if (delay > 0) {
						window.setTimeout(function () {
							instance = new Notification(title.substr(0, 100), attributes);
							
							if (onclick !== undefined) {
								instance.onclick = onclick;
							}
						}, delay * 1000);
					} else {
						instance = new Notification(title.substr(0, 100), attributes);
						
						if (onclick !== undefined) {
							instance.onclick = onclick;
						}
					}
				}
			}
		},
		enable: function (val) {
			if (val === true) {
				$("#chkGranted").get(0).checked = "checked";
				$("input[name='permission']").attr("disabled", true);
				$("#txtTitle, #txtMessage, #txtSeconds, #btnDisplay, #btnCode, #btnTwitter, #selIcon").removeAttr("disabled");
				$("#selIcon").next().removeClass("disabled");
				
				if (Notification.permission !== "granted") {
					Notification.permission = "granted";
				}
			} else {
				$("#chkDenied").get(0).checked = "checked";
				$("input[name='permission']").removeAttr("disabled");
				
				$("#selIcon").val("0").trigger("change", true);
				$("#txtTitle, #txtMessage, #txtSeconds, #btnDisplay, #btnCode, #btnTwitter, #selIcon").attr("disabled", true);
				$("#selIcon").next().addClass("disabled");
			}
		},
		generateCode: function (method) {
			var code = '',
				tab = ''	,
				title = $("#txtTitle").val(),
				message = $("#txtMessage").val(),
				icon = ($("#selIcon").val() === "1" ? $("#txtUrl").val() : ($("#selIcon").val() === "2" ? $("#hidFile").val() : "")),
				delay = Math.max(0, Math.min(60, $("#txtSeconds").val()));;
			
			code += '\<script\>\n';
			code += '\tvar Notification = window.Notification || window.mozNotification || window.webkitNotification;\n';
			code += '\n';
			code += '\tNotification.requestPermission(function (permission) {\n';
			code += '\t\t// console.log(permission);\n';
			code += '\t});\n'
			code += '\n';
			code += '\tfunction show() {\n';
			
			if (delay > 0) {
				code += '\t\twindow.setTimeout(function () {\n';
				tab = '\t';
			}
			
			code += tab + '\t\tvar instance = new Notification(';
			
			if (message.length > 0 || icon.length > 0) {
				code += '\n'
				code += tab + '\t\t\t';
				
			}
			
			code += '"' + $("#txtTitle").val() + '"';
			
			if (message.length > 0 || icon.length > 0) {
				code += ', {\n';
			}
			
			if (message.length > 0) {
				code += tab + '\t\t\t\tbody: "' + message + '"';
			}
			
			if (icon.length > 0) {
				code += ',\n';
				code += tab + '\t\t\t\ticon: "' + icon + '"\n';
			}
			
			if (message.length > 0 || icon.length > 0) {
				code += '\n';
				code += tab + '\t\t\t}\n';
				code += tab + '\t\t);\n';
			} else {
				code += ');\n';
			}
			
			code += '\n';
			code += tab + '\t\tinstance.onclick = function () {\n';
			code += tab + '\t\t\t// Something to do\n';
			code += tab + '\t\t};\n';
			
			code += tab + '\t\tinstance.onerror = function () {\n';
			code += tab + '\t\t\t// Something to do\n';
			code += tab + '\t\t};\n';
			
			code += tab + '\t\tinstance.onshow = function () {\n';
			code += tab + '\t\t\t// Something to do\n';
			code += tab + '\t\t};\n';
			
			code += tab + '\t\tinstance.onclose = function () {\n';
			code += tab + '\t\t\t// Something to do\n';
			code += tab + '\t\t};\n';
			
			if (delay > 0) {
				code += '\t\t}, ' + (delay * 1000) + ');\n';
			}
			
			if (method !== "button") {
				code += '\n';
				code += '\t\treturn false;\n';
			}
			
			code += '\t}\n';						
			code += '\</script\>\n';
			
			code += '\n';
			
			if (method === "button") {
				code += '<button type="button" onclick="show()">Notify me!</button>';
			} else {
				code += '<a href="#" onclick="return show()">Notify me!</a>';
			}

			editor.setValue(code);
			editor.setSelection({line: 0, ch: 0}, {line: editor.lineCount()});
			editor.focus();
		},
		translate: function (lang) {
			$("body").fadeOut("fast", function () {
				if (typeof lang === "undefined") {
					if (document.URL.indexOf("#") > 0) {
						lang = document.URL.split("#").pop();
					} else {
						lang = navigator.language ? navigator.language.substring(0, 2) : navigator.userLanguage.substring(0, 2);
					}
				}
				
				if (curLang !== lang) {
					curLang = lang;
					
					$("*[data-lang]").each(function (index, elem) {
						$(elem).text(_($(elem).data("lang"), true));
					});
					
					$("header dl.sub-nav dd").attr("class", "");
					
					switch (lang) {
						case "es":
							$("#langEs").parent().attr("class", "active");
							break;
						default:
							$("#langEn").parent().attr("class", "active");
					}
				}						
			}).fadeIn("slow");
		}
	};

	var editor = CodeMirror.fromTextArea(document.querySelector("#txtCode"), {
		mode: "text/html",
		lineNumbers: true,
		tabSize: 4,
		readOnly: true
	});

	window.onpopstate = function (event) {
		if (event.state) {
			Handler.translate(event.state.lang);
		} else {
			Handler.translate();
		}
	};

	$(document).foundation();

	$(".dropdown").change(function (event) {
		switch ($(this).val()) {
			case "1":
				$(".file").attr("disabled", true);
				$("#txtUrl").removeAttr("disabled").focus();
				$("#txtFileName, #hidFile").val("");
				break;
			case "2":
				$("#txtUrl").attr("disabled", true).val("");
				$(".file").removeAttr("disabled");
				break;
			default:
				$("#txtUrl").attr("disabled", true).val("");
				$("#txtFileName, #hidFile").val("");
				$(".file").attr("disabled", true);
		}
	});

	$("input[name='permission']").click(function (event) {
		if (Notification.permission !== "granted") {
			Handler.checkPermission();
		}
		
		event.preventDefault();
	});

	$("#frmMain").submit(function (event) {
		if ($(this).data("action") === "code") {
			$("#modCode").foundation("reveal", "open");
		} else {
			if (Notification.permission === "granted") {
				Handler.displayNotification(
					$("#txtTitle").val(),
					$("#txtMessage").val(),
					$("#selIcon").val() === "1" ? $("#txtUrl").val() : ($("#selIcon").val() === "2" ? $("#hidFile").val() : ""),
					$("#txtSeconds").val()
				);
			} else {
				Handler.enable(false);
			}
		}
		
		event.preventDefault();
	});

	$("#modCode").on("opened", function (event) {
		if ($("#frmMain").data("action") === "code") {
			Handler.generateCode($("#selMethod").val());
		}
	});

	$("#modCode").on("close", function (event) {
		editor.setValue("");
	});

	$("#btnDisplay").click(function (event) {
		$("#frmMain").data("action", "display");
	});

	$("#btnCode").click(function (event) {
		$("#frmMain").data("action", "code");
	});

	$("#filIcon").change(function (event) {
		var file = this.files[0];
		
		if (/^image\// .test(file.type)) {
			var reader = new FileReader();
			
			$("#txtFileName").val(file.name);
			
			reader.onload = function (e) {
				$("#hidFile").val(e.target.result);
			}
			
			reader.readAsDataURL(file);
		} else {
			alert("The file is not a valid image format");
		}
		
	});

	$("#modTwitter")
		.on("closed", function (){
			$("#txtTwitter").val("");
		})
		.on("opened", function (){
			$("#txtTwitter").focus();
		});

	$("#frmTwitter").submit(function (event) {
		$("#btnDisplayTwitter").attr("disabled", true);
		
		var script = document.createElement("SCRIPT");
		script.src = "https://duckduckgo.com/js/spice/twitter/" + $("#txtTwitter").val();
		script.onerror = function() {
			$('#modTwitter').foundation("reveal", "close");
			alert("Error");
		};
		document.body.appendChild(script);
		
		event.preventDefault();
	});

	$("#btnSelAll").click(function (event) {
		editor.setSelection({line: 0, ch: 0}, {line: editor.lineCount()});
		editor.focus();
	});

	$("#selMethod").change(function (event) {
		Handler.generateCode($(this).val());
	});

	$("#langEn, #langEs").click(function (event) {
		var lang = $(this).attr("href").substr(1);
		history.pushState({"lang": lang}, null, "#" + lang);
		Handler.translate(lang);
		event.preventDefault();
	});

	function ddg_spice_twitter(data) {
		if (data.current_status !== null) {
			Handler.displayNotification(
				"@" + data.user,
				data.current_status.text,
				data.profile_image,
				0,
				new Function('window.open("https://duckduckgo.com/?q=@' + data.user + '", "_blank")')
			);
		} else {
			Handler.displayNotification(
				"@" + data.user,
				data.description,
				data.profile_image,
				0,
				new Function('window.open("https://duckduckgo.com/?q=@' + data.user + '", "_blank")')
			);
		}
		
		$("#btnDisplayTwitter").removeAttr("disabled");
	}

	if (/Chrome\// .test(navigator.userAgent)) {
		window.addEventListener('click', function _chromeHackPerm(e) {
			Handler.checkPermission();
			window.removeEventListener('click', _chromeHackPerm);
		});
	} else {
		Handler.checkPermission();
	}
// -->
