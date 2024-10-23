"use client"

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Head from 'next/head';
import './page.css'
import playlist from './playlist.json'


export default function Home() {

  const [loading, setLoad] = useState(true);
  const [emo, setEmo] = useState(0)


  const emotion = ['화남', '불안', '우울함', '슬픔', '평온함', '기쁨']
  const point = [3, 3, 1, 1, 2, 0]
  const link = [
    "https://embed.music.apple.com/kr/playlist/%EA%B8%B0%EC%81%A0%EB%95%8C/pl.u-9N9LXPLt163zD4m?l=en",
    "https://embed.music.apple.com/kr/playlist/%EC%8A%AC%ED%94%8C%EB%95%8C/pl.u-38oWXBgTYGb91NM?l=en",
    "https://embed.music.apple.com/kr/playlist/%ED%8F%89%EC%98%A8%ED%95%A0%EB%95%8C/pl.u-DdANrk6u0ekBAL1?l=en",
    "https://embed.music.apple.com/kr/playlist/%ED%99%94%EB%82%A0%EB%95%8C/pl.u-e98lkV9Fa6M0918?l=en"
  ]

  useEffect(() => {
    const messages = JSON.parse(localStorage.getItem("text"))
    if(messages != null) {
      getRes(messages)
      localStorage.removeItem('text')
    }
  }, [])

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

  async function getRes(msg){
    try {
      const model = genAI.getGenerativeModel({
        model:"gemini-1.5-flash",
        safetySettings,
        systemInstruction: "너는 심리상담사야, 상대가 '결과 출력'이라 하면 너는 지금까지 상대방을 상담한 내용을 보고 상대 심리 최종 총평 또는 조언(줄글형식)을 무조건 300자 이내로 근데 최대한 많이 해주고 글 맨 뒤에 상대방의 감정을 (화남, 불안, 우울함, 슬픔, 평온함, 기쁨) 이 6가지중 1가지를 선택해서 '$'뒤에 붙여줘"
      });

      const temp =  processMessageToGemini(msg)

      const chat = model.startChat({
        history:temp,
        generationConfig:{
          maxOutputTokens: 400,
          temperature: 1.5,
        }
      });

      console.log((await chat.getHistory()))

      const res = await chat.sendMessage('결과 출력');
      const response = await res.response;
      const text = response.text()

      document.querySelector('.asdf').innerHTML = text.split('$')[0]

      if(emotion.indexOf(text.split('$')[1].trim()) !== -1){
        const index = emotion.indexOf(text.split('$')[1].trim())
        changeBg(index)
        setEmo(point[index])
        console.log(point[index])
      }
      
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setLoad(false)
    }
  }
  function btnClick() {
    window.location.href = '/'
  }

  return (
    <div className="container1">
        <Head>
          <title>Psychotherapy</title>
          <meta name="description" content="Psychotherapy - IMAE DFD Team" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="head">
          <div className="t1">IMAE DFD</div>
          <div className="t2">TEAM</div>
          <div className="t3">PSYCHOTHERAPY</div>
        </div>
        <div className="comCxt">
          <div className="line"></div>
          <div className="comT">Commnet</div>
          <div className="comment asdf">불러오는중...</div>
        </div>
        <div className="comCxt song">
          <div className="songT">Today's Playlist</div>
          
          <div className="playlist">
            {
              (!loading)?(
                <>
                  <iframe className="playlist" allow="autoplay *; encrypted-media *;" frameborder="0" height="450"  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src={`${link[emo]}`}></iframe>
                </>
              ):(
                <div>불러오는중...</div>
              )
            }
          </div>
        </div>
        <div className='firstSub center small but'>
          <button className="button bott" onClick={btnClick.bind(this)}>
              <div className="rect1">▶</div>
              <div style={{margin:"0 10px 0 10px"}}>홈으로 돌아가기</div>
              <div className="rect1">◀︎</div>
          </button>
        </div>
        <div className='foot'>© 2024 2-9 DFD Team. All rights reserved. Redefining standards with style and innovation.</div>
      </div>
  )
}