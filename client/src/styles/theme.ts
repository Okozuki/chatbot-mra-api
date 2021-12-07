const white = '#fff'
const blue = '#427ee1'

const miscroPhone = '#427ee1'
const miscroPhoneActive = '#757575'
const webBrowser = '#cccccc'

const botAppBackgroud = `${white}`
const secondaryColor = `${blue}`
const avatarBorderColor = `${blue}`
const chatBox = `${white}`
const botMessageBackgroud = `${white}`
const botMessageBorder = `${blue}`
const botMessageColor = `${blue}`

const userMessageBackgroud = `${blue}`
const userMessageBorder = `${blue}`
const userMessageColor = `${white}`

export const theme = {
  AgentBar: {
    Avatar: {
      size: '42px'
    },
    css: {
      backgroundColor: `${secondaryColor}`,
      borderColor: `${avatarBorderColor}`
    }
  },
  Message: {
    css: {
      fontWeight: 'bold'
    }
  },
  colors: {
    color: `${blue}`
  },
  isZoomUserInput: {
    backgroundColor: '#fff',
    height: 'auto',
    margin: '0 auto',
    maxWidth: '740px',
    width: '100%',
    zIndex: 99
  },
  messages: {
    bot: {
      backgroundColor: `inherit`,
      borderColor: `inherit`,
      borderRadius: '15px 15px 15px 0 ',
      borderStyle: 'solid',
      borderWidth: 1.5,
      color: `inherit`,
      display: 'table-row',
      fontSize: '1em',
      fontWeight: 550,
      lineHeight: 'normal',
      padding: 10,
      textAlign: 'left'
    },
    botWrapper: {
      backgroundColor: `inherit`,
      borderColor: `inherit`,
      borderRadius: '15px 15px 15px 0 ',
      display: 'table-row'
    },

    mediaImg: {
      display: 'block'
    },
    user: {
      backgroundColor: `inherit`,
      borderRadius: '15px 15px 0 15px',
      color: `inherit`,
      display: 'table-row',
      fontSize: '1em',
      fontWeight: 550,
      lineHeight: 'normal',
      padding: 10,
      textAlign: 'right'
    },
    userWrapper: {
      backgroundColor: `inherit`,
      borderRadius: '15px 15px 0 15px',
      display: 'table-row'
    }
  },
  vars: {
    avatarBorderColor: `${avatarBorderColor}`,
    botAppBackgroud: `${botAppBackgroud}`,
    botMessageBackgroud: `${botMessageBackgroud}`,
    botMessageBorder: `${botMessageBorder}`,
    botMessageColor: `${botMessageColor}`,
    chatBox: `${chatBox}`,
    minimizeboxBackgroud: `${blue}`,
    minimizeboxColor: `${white}`,
    miscroPhone: `${miscroPhone}`,
    miscroPhoneActive: `${miscroPhoneActive}`,

    secondaryColor: `${secondaryColor}`,
    userMessageBackgroud: `${userMessageBackgroud}`,
    userMessageBorder: `${userMessageBorder}`,
    userMessageColor: `${userMessageColor}`,
    webBrowser: `${webBrowser}`
  }
}



