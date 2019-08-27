var form = document.forms.myform;
isCode = false
form.code.addEventListener('change', function(e) {
  var result = e.target.files[0];
  var reader = new FileReader();
  reader.readAsText(result);
  reader.addEventListener('load', function() {
    txt = reader.result
    output = ""
    code = ""
    codes = txt.split("\n")
    document.getElementById("input_txt").style.transform = "translateY(100%)";
    if (isCode) { //今は常にfalse
      if (txt.match("@n") == null) {
        N_identifier = "@n"
      } else if (txt.match("@@n") == null) {
        N_identifier = "@@n"
      } else {
        //ここには来ないでほしい
        console.log("error")
      }
      for (i = 0; i < codes.length; i++) {
        //余分な空白・コメントを削除
        line = codes[i].split("//")[0].trim()
        if (line != "") { //何も書いてない行は削除　それ以外をcode変数に追加
          code += line
          //改行の代わりに識別記号を追加
          code += N_identifier
        }
      }
      //本来あったスペースの仮置き（識別記号を定義
      if (code.match("@s") == null) {
        S_identifier = "@s"
      } else if (code.match("]s") == null) {
        S_identifier = "]s"
      } else {
        //こうなるとまずい！
        console.log("error")
      }
      //スペースをすべて識別記号に置き換える
      while (code.match(" ")) {
        code = code.replace(" ", S_identifier)
      }
    } else { //今は基本的にこっち
      for (i = 0; i < codes.length; i++) {
        //余分な空白・コメントを削除
        line = codes[i].split("//")[0].trim()
        if (line != "") { //何も書いてない行は削除　それ以外をcode変数に追加
          code += line
        }
      }
      //スペースをすべて消す
      while (code.match(" ")) {
        code = code.replace(" ", "")
      }
      console.log(code)
    }

    form.img_file.addEventListener('change', function(e) {
      var file = e.target.files[0],
        reader = new FileReader(),
        preview = document.getElementById("preview")
      // 画像ファイル以外の場合は何もしない
      if (file.type.indexOf("image") < 0) {
        return false;
      }
      // ファイル読み込みが完了した際のイベント登録
      reader.onload = (function(file) {
        return function(e) {
          var dstWidth = 500
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          var image = new Image();
          var reader = new FileReader();
          image.crossOrigin = "Anonymous";
          image.onload = function(event) {
            ratio = this.height / this.width
            var dstHeight = ratio * dstWidth
            canvas.width = dstWidth;
            canvas.height = dstHeight;
            ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, dstWidth, dstHeight);
            $("#dst").attr('src', canvas.toDataURL());
            img_data = ctx.getImageData(0, 0, dstWidth, dstHeight)
            img_data_red = []
            for (i = 0; i < img_data.data.length; i += 4) {
              img_data_red.push(img_data.data[i]) //白黒画像なので、赤要素だけ抽出
            }
            console.log(img_data_red)
            // コールバック関数を実行する関数
            function CountBlack(callback) {
              black = 0
              for (i = 0; i < img_data_red.length; i++) {
                if (img_data_red[i] < 250) { //赤が250越え→黒ではないでしょう
                  black++
                }
              }
              callback();
            }
            CountBlack(
              function() {
                function isHalf(value) {
                  return !value.match(/[^\x01-\x7E]/) || !value.match(/[^\uFF65-\uFF9F]/);
                }
                console.log("code_length:", code.length)
                if (isHalf(code[0])) {
                  code_black_ratio = (code.length / 2) / black
                  slice = 2
                } else {
                  code_black_ratio = (code.length) / black
                  slice = 1
                }
                dstWidth = dstWidth * Math.sqrt(code_black_ratio) * 1.01 //微妙に残るのを防止
                dstHeight = ratio * dstWidth
                canvas.width = dstWidth;
                canvas.height = dstHeight;
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, dstWidth, dstHeight);
                $("#dst").attr('src', canvas.toDataURL());
                img_data = ctx.getImageData(0, 0, dstWidth, dstHeight)
                console.log(img_data.data)
                img_data_red = []
                for (i = 0; i < img_data.data.length; i += 4) {
                  img_data_red.push(img_data.data[i]) //白黒画像なので、赤要素だけ抽出
                }
                for (i = 0; i < img_data_red.length; i++) {
                  if (i % Math.floor(dstWidth) == 0) {
                    output = output + "\n"
                  }
                  try {
                    if (img_data_red[i] < 250) {
                      c = code[0]
                      //全角半角判定ー機能してない
                      output = output + code.slice(0, slice)
                      code = code.slice(slice)
                    } else {
                      output = output + "  "
                    }
                  } catch {
                    break
                  }
                }
                output += code
                /*
                if(FontSize<2){
                  textarea.style.fontSize = "1px"
                  document.getElementById("note").style.display="block"
                }else{
                  textarea.style.fontSize = FontSize+ "px"
                }
                */
                if (isCode) {
                  output = `
                      c=\`` + output + `\`;
                      ra=(c,b,a)=>{while(c.match(b)){c=c.replace(b,a)};return c}
                      c=ra(c," ","");c=ra(c,"\\n","");c=ra(c,\"` + S_identifier + `\"," ");c=ra(c,\"` + N_identifier + `\","\\n");eval(c)`
                  console.log("done")
                } else {
                  let r_canvas = document.getElementById('result_canvas')
                  let fontSize=10
                  let rctx=r_canvas.getContext('2d');
                  r_canvas.setAttribute("width",dstWidth*fontSize)
                  r_canvas.setAttribute("height",dstHeight*fontSize)

                  rctx.font = fontSize;+"px"
                  rctx.beginPath () ;
                  rctx.font = fontSize+"px MS Gothic"
                  lines=output.split( "\n" )
                  for(i=0; i<lines.length;i++) {
                  	var line = lines[i] ;
                  	var addY = 1 ;
                  	// 2行目以降の水平位置は行数とlineHeightを考慮する
                  	addY += fontSize * i
                  	rctx.fillText( line,0, 1 + addY ) ;
                  }
                  var data = r_canvas.toDataURL();
                  document.getElementById("result_img").src=data
                  element =document.createElement('div'),
                  element.innerHTML="<a download="+data+">Image Download</a>";
                  document.body.appendChild(element);
                }
              })
          }
          image.src = e.target.result
        }
      }(file));
      reader.readAsDataURL(file);
      document.getElementById("input_img").style.transform = "translateY(100%)"
    })
  })
})
