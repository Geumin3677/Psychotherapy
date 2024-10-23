"use client"

import { useEffect, useState } from "react";
import { json, useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Head from 'next/head';
import './page.css'
import { usePathname, useRouter } from 'next/navigation';


export default function Home() {
  const [scroll, setSc] = useState(false);
  const [loading, setLoad] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "안녕하세요. 저는 AI 심리상담사 입니다. 오늘 상태는 어떠신가요?",
      sender: "gemini"
    }
  ])

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const detectTop = () => {
      var scrollTop = document.querySelector('.chatCxt').scrollTop;
      if(scrollTop <= 30) {
        document.querySelector('.chatCxt').id = "off"
        setSc(true)
      } else {
        document.querySelector('.chatCxt').id = ""
        setSc(false)
      }
    }
      
    const chatCxt = document.querySelector('.chatCxt')
    chatCxt.scrollTo({top:chatCxt.scrollHeight, behavior:"smooth"})
    chatCxt.addEventListener('scroll', detectTop);
    return () => {
      document.querySelector('.chatCxt')?.removeEventListener('scroll', detectTop);
    };
  }, [])

  function keyUp(e) {
    if(e.code == 'Enter') {
      handleSend()
    }
  }

  
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_KEY);
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }
  ]

  const emotion = ['화남', '불안', '우울함', '슬픔', '평온함', '기쁨']

  function changeBg(index) {
    if(index <=1) {
      document.querySelector('.container1').className = 'container1'
      document.querySelector('.container1').classList.add('emRed')
    } else if(index <= 3) {
      document.querySelector('.container1').className = 'container1'
      document.querySelector('.container1').classList.add('emBlue')
    } else if(index <= 4) {
      document.querySelector('.container1').className = 'container1'
      document.querySelector('.container1').classList.add('emGreen')
    } else if(index <= 5) {
      document.querySelector('.container1').className = 'container1'
      document.querySelector('.container1').classList.add('emYellow')
    }
  }

  async function handleSend() {
    if(!(loading)) {
      if(document.querySelector('.input').value != ""){
        const newText = document.querySelector('.input').value 
        const chatCxt = document.querySelector('.chatCxt')
        document.querySelector('.input').value = ""

        const newMessage = {
          message: newText,
          sender: "user",
        };

        setMessages((prev) => [...prev, newMessage])
        chatCxt.scrollTo({top:chatCxt.scrollHeight, behavior:"smooth"})

        document.querySelector('.input').disabled = true;
        document.querySelector('.inputCxt').classList.add('opa')
        document.querySelector('.input').placeholder = '답변중입니다. 잠시만 기다려주세요'
        setLoad(true)

        try {
          const model = genAI.getGenerativeModel({
            model:"gemini-1.5-flash",
            safetySettings,
            systemInstruction: "너는 심리상담사야, 너는 상대방을 상담해줘야해. 또한 대화 끝부분에 상대방의 감정을 (화남, 불안, 우울함, 슬픔, 평온함, 기쁨) 이 6가지중 1가지를 선택해서 '$'뒤에 붙여줘, 말은 되도록이면 짧게 대화체로. 감정적으로 상대를 위로해주거나 상담해줘. 반말은 쓰지 말아줘. 그리고 상대와의 상담이 충분히 진행된것 같으면 상담을 중지할지 물어보고 중지한다고 하면 '$종료'라고 보내줘"
          });

          const temp =  processMessageToGemini(messages)

          const chat = model.startChat({
            history:temp,
            generationConfig:{
              maxOutputTokens: 200,
              temperature: 1.5,
            }
          });

          console.log((await chat.getHistory()))

          const res = await chat.sendMessage(newText);
          const response = await res.response;
          const text = response.text()

          if(text.includes('$종료')){
            console.log('상담 종료')
            setMessages(prev => [...prev, {
              message: '상담이 종료되었습니다',
              sender: 'gemini'
            }])

            localStorage.setItem("text", JSON.stringify(messages))

            window.location.href = '/result'
          } else {

            setMessages(prev => [...prev, {
              message: text.split('$')[0],
              sender: 'gemini'
            }])

            if(emotion.indexOf(text.split('$')[1].trim()) !== -1){
              const index = emotion.indexOf(text.split('$')[1].trim())
              changeBg(index)
            }
          }
          
        } catch (error) {
          console.error("Error processing message:", error);
        } finally {
          document.querySelector('.input').disabled = false;
          document.querySelector('.inputCxt').classList.remove('opa')
          document.querySelector('.input').placeholder = '채팅을 입력해보세요!'
          setLoad(false)
          const chatCxt = document.querySelector('.chatCxt')
          chatCxt.scrollTo({top:chatCxt.scrollHeight, behavior:"smooth"})
        }
      }
    }
  }

  function processMessageToGemini(messa) {
    const chate = []
    chate.push(
      {
        role: 'user',
        parts: [{text:'안녕 반가워'}]
      }
    )
    
    messa.map((msg, i) => {
      chate.push(
        {
          role: (msg.sender == 'user') ? ('user') : ('model'),
          parts: [{text:msg.message}]
        }
      )
    })
    
    return chate
  }


  return (
    <div className="container1">
        <Head>
          <title>Psychotherapy</title>
          <meta name="description" content="Psychotherapy - IMAE DFD Team" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      <div className="profileCxt">
        {/* <img className="profileImg" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"></img> */}
        <div className="profileName">AI 상담사</div>
      </div>
      <div className="chatCxt" id="off">
        {
          messages.map((message, i) => {
            if(message.sender == 'user') {
              return(
                <div className="MYchat" key={i}>{message.message}</div>
              )
            } else {
              return(
                <div className="AIchat" key={i}>
                  <div className="deco2">◆</div>
                  <div className="txt">{message.message}</div>
                </div>
              )
            }
          })
        }
      </div>
      <div className="inputCxt">
        <div className="deco">＞</div>
        <input className="input" placeholder="채팅을 입력해보세요!" onKeyUp={(e) => keyUp(e)}></input>
        <img className="sendBtn" src="/send.png" onClick={handleSend.bind()}></img>
      </div>
    </div>
  )
}