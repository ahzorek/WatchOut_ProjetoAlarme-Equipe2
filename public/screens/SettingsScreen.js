import Screen from './Screen.js'
import treatmentTitles from '../data/treatmentTitles.db.js'

import createSegmentedPicker from '../utils/createSegmentedPicker.js'

import { closeIcon } from '../icons/index.js'

class SettingsScreen extends Screen {
  constructor(app) {
    super(app)
    this.taps = 0
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'settings-screen')
    this.structure = null
    this.user = null
    this.editing = {}

    this.render()
  }

  hasEdited() {
    return Object.keys(this.editing).length !== 0
  }

  async submitChanges() {
    try {
      const userId = localStorage.getItem('userId')
      const res = await fetch(`/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.editing),
      })

      if (!res.ok) {
        throw new Error(`bad stuff: ${res.status}`)
      }
      const { user, message } = await res.json()

      console.log(message)

      return user

    } catch (err) {
      console.error('Error:', err)
    }
  }

  undoChanges() {
    this.editing = {}
    this.app.goBack()
  }

  userLogout() {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.clear()
      location.href = '/'
    }
  }

  async exitScreen() {
    if (this.hasEdited()) {
      console.log('esta editando')
      const updatedUser = await this.submitChanges()
      this.app.updateUserState(updatedUser)
      await this.app.updateInterfaceAfterChanges()
      this.app.dashboardScreen.refresh()
      this.app.goBack()

    } else {
      console.log('voltou sem editar nada')
      this.app.goBack()
    }
  }

  makeDevMode() {
    if (this.taps < 7) {
      this.taps++
      console.log('tap tap, little tappy boy')
    }
    else if (!this.app.isDevMode && this.taps >= 7) {
      this.taps = 0
      this.app.isDevMode = true
      this.app.devMode(true)
    }
    else if (this.app.isDevMode && this.taps >= 3) {
      this.taps = 0
      this.app.isDevMode = false
      this.app.devMode()
    }
  }

  createStructure(user) {
    const structure = document.createElement("div")
    structure.classList.add('structure')

    const header = document.createElement("header")
    header.classList.add("top-nav", "side-screen")

    const title = document.createElement("h2")
    title.classList.add("title1")
    title.textContent = "Ajustes"

    title.addEventListener('click', () => this.makeDevMode())

    const closeButton = document.createElement("button")
    closeButton.classList.add("nav-btn", "back-btn")
    closeButton.innerHTML = closeIcon

    closeButton.addEventListener('click', async () => {
      closeButton.disabled = true
      this.stopSong()
      await this.exitScreen()
    }
    )


    header.appendChild(title)
    header.appendChild(closeButton)

    const form = document.createElement("form")
    form.classList.add("settings-form")

    const settingsItems = this.createSettingsItems(user)
    settingsItems.classList.add("settings-items")

    const logoutButton = document.createElement("button")
    logoutButton.innerText = 'Logout'

    logoutButton.addEventListener('click', () => {
      this.stopSong(); // Stop the song when the logout button is clicked
      this.userLogout(); // Add your logout logic here
    });

    form.appendChild(settingsItems)
    form.appendChild(logoutButton)

    form.addEventListener('submit', (e) => e.preventDefault())

    structure.appendChild(header)
    structure.appendChild(form)

    return structure
  }

  stopSong() {
    // Add logic to stop the song here
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }

  createSettingsItems(user) {
    console.log('a porra do user é::::', user)
    const [ringtone, songId] = user.defaultRingtone.split('&#')
    const elements = []
    const container = document.createElement('div')

    const tratamentoContainer = document.createElement('div')
    const tratamentoTitle = document.createElement('h3')
    tratamentoTitle.classList.add('title3')
    tratamentoTitle.textContent = 'Tratamento'

    tratamentoContainer.appendChild(tratamentoTitle)

    const tratamentoSelect = document.createElement('select')
    tratamentoSelect.id = 'formaTratamento'
    tratamentoSelect.name = 'title'

    const tratamentoOption = document.createElement('option')
    tratamentoOption.selected = true
    tratamentoOption.disabled = true
    tratamentoOption.textContent = 'Selecione'

    tratamentoSelect.appendChild(tratamentoOption)

    treatmentTitles.forEach(({ title }) => {
      const tratamentoOption = document.createElement('option')
      tratamentoOption.textContent = title
      tratamentoOption.value = title
      tratamentoOption.selected = (title === this.app.state.user.title)

      tratamentoSelect.appendChild(tratamentoOption)

    })

    tratamentoContainer.appendChild(tratamentoSelect)

    elements.push(tratamentoContainer)

    const nameContainer = document.createElement('div')
    const nameTitle = document.createElement('h3')
    nameTitle.classList.add('title3')
    nameTitle.textContent = 'Seu Nome'

    nameContainer.appendChild(nameTitle)

    const nameInput = document.createElement('input')
    nameInput.id = 'nome'
    nameInput.type = 'text'
    nameInput.value = user.nome
    nameInput.name = 'nome'

    nameContainer.appendChild(nameInput)

    elements.push(nameContainer)

    const cityContainer = document.createElement('div')
    const cityTitle = document.createElement('h3')
    cityTitle.classList.add('title3')
    cityTitle.textContent = 'Cidade ou Região'

    cityContainer.appendChild(cityTitle)

    const cityInput = document.createElement('input')
    cityInput.id = 'city'
    cityInput.type = 'text'
    cityInput.value = user.city
    cityInput.name = 'city'

    cityContainer.appendChild(cityInput)

    elements.push(cityContainer)

    //seletor unidade temp
    const containerTemp = document.createElement('div')

    const title = document.createElement('h3')
    title.classList.add('title3')
    title.textContent = 'Unidade Temperatura'

    containerTemp.appendChild(title)

    const temperatureOptions = [
      { optionName: 'Celsius', optionValue: 'C' },
      { optionName: 'Fahrenheit', optionValue: 'F' },
      { optionName: 'Kelvin', optionValue: 'K' }
    ]
    const temperaturePicker = createSegmentedPicker(
      temperatureOptions, 'unit', user.unit
    )

    containerTemp.appendChild(temperaturePicker)
    elements.push(containerTemp)

    //formato relogio
    const is12HourContainer = document.createElement('div')
    const is12HourTitle = document.createElement('h3')
    is12HourTitle.classList.add('title3')
    is12HourTitle.textContent = 'Formato Hora'

    is12HourContainer.appendChild(is12HourTitle)

    const is12HoursOptions = [
      { optionName: '12 Horas', optionValue: true },
      { optionName: '24 Horas', optionValue: false }
    ]
    const is12HourPicker = createSegmentedPicker(
      is12HoursOptions, 'is12Hour', user.is12Hour, true
    )

    is12HourContainer.appendChild(is12HourPicker)
    elements.push(is12HourContainer)

    //mostrar/esconder segundos
    const hideSecContainer = document.createElement('div')
    const hideSecTitle = document.createElement('h3')
    hideSecTitle.classList.add('title3')
    hideSecTitle.textContent = 'Segundos'

    hideSecContainer.appendChild(hideSecTitle)

    const secondsOptions = [
      { optionName: 'Esconder', optionValue: true },
      { optionName: 'Mostrar', optionValue: false }
    ]
    const secondsPicker = createSegmentedPicker(
      secondsOptions, 'hideSec', user.hideSec, true
    )

    hideSecContainer.appendChild(secondsPicker)
    elements.push(hideSecContainer)

    //usar tema neutro
    const useNeutralThemeContainer = document.createElement('div')
    const useNeutralThemeTitle = document.createElement('h3')
    useNeutralThemeTitle.classList.add('title3')
    useNeutralThemeTitle.textContent = 'Usar Tema Neutro'

    useNeutralThemeContainer.appendChild(useNeutralThemeTitle)

    const useNeutralThemesOptions = [
      { optionName: 'Não', optionValue: false },
      { optionName: 'Sim', optionValue: true }
    ]
    const useNeutralThemePicker = createSegmentedPicker(
      useNeutralThemesOptions, 'useNeutralTheme', user.useNeutralTheme, true
    )

    useNeutralThemeContainer.appendChild(useNeutralThemePicker)
    elements.push(useNeutralThemeContainer)

    //ringtone Jamento API
    const jamendoContainer = document.createElement('div');
    const jamendoTitle = document.createElement('h3');
    jamendoTitle.classList.add('title3');
    jamendoTitle.textContent = 'Toque';

    jamendoContainer.appendChild(jamendoTitle);

    const jamendoSelect = document.createElement('select');
    jamendoSelect.id = 'defaultRingtone';
    jamendoSelect.name = 'defaultRingtone';

    const jamendoDefaultOption = document.createElement('option');
    jamendoDefaultOption.disabled = true;
    jamendoDefaultOption.value = 'null';
    jamendoDefaultOption.textContent = 'Selecione';

    jamendoSelect.appendChild(jamendoDefaultOption);

    // Fetch songs from the Jamendo API

    async function fetchJamendoTracks() {
      try {
        const jamendoResponse = await fetch('https://api.jamendo.com/v3.0/tracks/?client_id=1d583eeb');
        const jamendoData = await jamendoResponse.json();


        const jamendoSongs = jamendoData.results;
        jamendoSongs.forEach(song => {
          const jamendoOption = document.createElement('option');
          jamendoOption.selected = (songId == song.id) ? true : false;
          jamendoOption.value = song.audio + '&#' + song.id
          jamendoOption.textContent = song.name;
          jamendoSelect.appendChild(jamendoOption);
        });

        // Add event listener to play the selected song
        jamendoSelect.addEventListener('change', () => {
          const selectedSong = jamendoSelect.value.split('&#')[0]
          playSelectedSong(selectedSong);
        });
      } catch (error) {
        console.error('Error fetching Jamendo songs:', error);
      }
    }

    // Function to play the selected song
    function playSelectedSong(songUrl) {
      // Use the songUrl to play the audio, for example, using an audio element
      const audioPlayer = document.getElementById('audioPlayer');
      audioPlayer.src = songUrl;
      audioPlayer.play();

      setTimeout(() => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }, 5000);

    }

    // Call the function to fetch Jamendo tracks
    fetchJamendoTracks();

    jamendoContainer.appendChild(jamendoSelect);
    elements.push(jamendoContainer);


    elements.forEach(el => {
      const input = el.querySelector('input')
      if (input?.type === 'text') {
        input.addEventListener('keyup', (e) => this.handleInputChanges(e))
      } else
        el.addEventListener('change', (e) => this.handleInputChanges(e))
    })

    elements.forEach(el => container.appendChild(el))

    return container
  }

  handleInputChanges(e) {
    const isBool = e.target.getAttribute('data-isBool')
    const key = e.target.name
    const value = (isBool == 'true')
      ? e.target.value == 'true'
      : e.target.value

    this.editing = { ...this.editing, [key]: value }

    console.log(this.editing)
  }

  render() {

    if (this.loading) {
      this.editing = {}
      this.container.innerHTML = `
      <div class="loading-spinner"></div>
      `
    } else {
      console.log('initialing editing settings', this.editing)
      this.container.innerHTML = ''
      this.container.appendChild(this.structure)
    }
    this.app.appendScreen(this.container)
  }

  loadData() {
    this.user = this.app.state.user
    this.structure = this.createStructure(this.user)

    setTimeout(() => {
      this.loading = false
      this.render()
    }, 500)
  }
}

export default SettingsScreen

