const myURL = document.getElementById('myURL')
const myUsername = document.getElementById("myUsername")
const myBtn = document.getElementById("myBtn")
const mySpinner = document.getElementById("mySpinner")
const myVod = document.getElementById('myVod')
const myImg = document.getElementById('myImg')
const myPar = document.getElementById('myPar')
const myLink = document.getElementById('myLink')
const myError = document.getElementById('myError')
const myPar2 = document.getElementById('myPar2')

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        const url = tabs[0].url

        if(isClipUrlValid(url)) myURL.value = url

        if(isVodUrlValid(url)){
            chrome.tabs.executeScript(null, { file: 'content.js' }, () => {
                const port = chrome.tabs.connect(tabs[0].id)
                port.postMessage('vodUrl')
                port.onMessage.addListener(res => {
                    const timestamp = res.timestamp.split(':')
                    myURL.value = url.match(/^(?:https:\/\/)?(?:www\.)?twitch\.tv\/videos\/\d+([^\D]+)/g) + `?t=${timestamp[0]}h${timestamp[1]}m${timestamp[2]}s`
                })
            })
        }
    })

    myBtn.addEventListener("click", fetchData);
    myURL.addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        myBtn.click();
      }
    })
    myUsername.addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        myBtn.click();
      }
    })
})

const isClipUrlValid = url => /^(?:https:\/\/)?clips\.twitch\.tv\/([^\/\s]+)$/.test(url) ||
                                /^(?:https:\/\/)?(?:www\.)?twitch\.tv\/(\S+)\/clip\/([^\/\s]+)$/.test(url)

const isVodUrlValid = url => /^(?:https:\/\/)?(?:www\.)?twitch\.tv\/videos\/([^\/\s]+)$/.test(url)

const fetchData = async () => {
    myError.style.display = 'none'
    myVod.style.display = 'none'
    myBtn.style.display = 'none'
    mySpinner.style.display = 'block'

    const url = myURL.value
    const username = myUsername.value

    try{
        const res = await fetch(`https://twitch-clip-vod-sync.herokuapp.com?url=${url}&username=${username}`)
        const data = await res.json()

        if(data.vod){
            myImg.src = data.streamer_profile_image
            myPar.innerText = `${data.streamer}'s perspective:`
            myLink.href = data.vod
            myLink.innerText = data.vod
            myVod.style.display = 'block'
        }else{
            myPar2.innerText = data.message
            myError.style.display = 'block'
        }

        mySpinner.style.display = 'none'
        myBtn.style.display = 'block'

    }catch(err){
        console.log(err)
    }
}
