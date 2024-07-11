import { Button } from '@/components/button'
import { Calendar } from '@/components/calendar'
import { Input } from '@/components/input'
import { Loading } from '@/components/loading'
import { Modal } from '@/components/modal'
import { TripDetails, tripServer } from '@/server/trip-server'
import { colors } from '@/styles/colors'
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils'
import dayjs from 'dayjs'
import { router, useLocalSearchParams } from 'expo-router'
import {
  CalendarRange,
  Calendar as IconCalendar,
  Info,
  Mail,
  MapPin,
  Settings2,
  User,
} from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Alert, Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native'
import { DateData } from 'react-native-calendars'
import { Activities } from './activities'
import { Details } from './details'
import { validateInput } from '@/utils/validateInput'
import { participantsServer } from '@/server/participants-server'
import { tripStorage } from '@/storage/trip'

export interface TripData extends TripDetails {
  when: string
}

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
  CONFIRM_ATTENDANCE = 3,
}

export default function Trip() {
  const [isLoadingTrip, setIsLoadingTrip] = useState(true)
  const [tripDetails, setTripDetails] = useState({} as TripData)
  const [option, setOption] = useState<'activity' | 'details'>('activity')
  const [showModal, setShowModal] = useState(MODAL.NONE)
  const [destination, setDestination] = useState('')
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false)
  const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false)

  const { id: tripID, participant } = useLocalSearchParams<{ id: string, participant?: string }>()

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true)

      if (participant) {
        setShowModal(MODAL.CONFIRM_ATTENDANCE)
      }

      if (!tripID) {
        return router.back()
      }

      const trip = await tripServer.getByID(tripID)

      const maxLengthDestination = 14
      const destination =
        trip.destination.length > maxLengthDestination
          ? trip.destination.slice(0, maxLengthDestination) + '...'
          : trip.destination

      const starts_at = dayjs(trip.starts_at).format('DD')
      const monthStart = dayjs(trip.starts_at).format('MMM')
      const ends_at = dayjs(trip.ends_at).format('DD')
      const monthEnd = dayjs(trip.ends_at).format('MMM')

      setDestination(trip.destination)

      setTripDetails({
        ...trip,
        when: `${destination} de ${starts_at} ${monthStart} à ${ends_at} ${monthEnd}`,
      })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadingTrip(false)
    }
  }

  function handleSelectDates(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    })

    setSelectedDates(dates)
  }

  async function handleUpdateTrip() {
    try {
      if (!tripID) return

      if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
        return Alert.alert('Atualizar viagem', 'Preencha todos os campos.')
      }

      setIsUpdatingTrip(true)

      await tripServer.update({
        id: tripID,
        destination,
        starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
      })

      Alert.alert('Atualizar viagem', 'Viagem atualizada com sucesso', [
        {
          text: 'Ok',
          onPress: () => {
            setShowModal(MODAL.NONE)
            getTripDetails()
          },
        },
      ])
    } catch (error) {
      console.log(error)
    } finally {
      setIsUpdatingTrip(false)
    }
  }

  function resetFields() {
    setGuestName('')
    setGuestEmail('')
    setShowModal(MODAL.NONE)
  }

  async function handleConfirmAttendance() {
    try {
      if (!participant || !tripID) return

      if (!guestName.trim() || !guestEmail.trim()) {
        return Alert.alert('Confirmar presença', 'Preencha todos os campos.')
      }

      if (!validateInput.email(guestEmail.trim())) {
        return Alert.alert('Confirmar presença', 'E-mail inválido.')
      }

      setIsConfirmingAttendance(true)

      await participantsServer.confirmTripByParticipantId({
        participantId: participant,
        name: guestName,
        email: guestEmail.trim(),
      })

      Alert.alert('Confirmar presença', 'Viagem confirmada com sucesso.')

      await tripStorage.save(tripID)
      resetFields()
    } catch (error) {
      console.log(error)
      Alert.alert('Confirmar presença', 'Erro ao confirmar presença.')
    } finally {
      setIsConfirmingAttendance(false)
    }
  }

  async function handleRemoveTrip() {
    try {
      Alert.alert('Remover viagem', 'Tem certeza que deseja remover a viagem?', [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Remover',
          onPress: async () => {
            await tripStorage.remove()
            router.navigate('/')
          },
        }
      ])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getTripDetails()
  }, [])

  if (isLoadingTrip) return <Loading />

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field placeholder="Destino" value={tripDetails.when} readOnly />

        <TouchableOpacity activeOpacity={0.7} onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
          <View className="size-9 items-center justify-center rounded-md bg-zinc-800">
            <Settings2 color={colors.zinc[400]} size={20} />
          </View>
        </TouchableOpacity>
      </Input>

      {option === 'activity' ? (
        <Activities tripDetails={tripDetails} />
      ) : (
        <Details tripID={tripDetails.id} />
      )}

      <View
        className={`absolute ${Platform.OS === 'android' ? 'bottom-2' : 'bottom-7'} z-10 w-full justify-end self-center rounded-2xl bg-zinc-950`}>
        <View className="w-full flex-row gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <Button
            variant={option === 'activity' ? 'primary' : 'secondary'}
            onPress={() => setOption('activity')}
            flex={1}>
            <CalendarRange
              color={option === 'activity' ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />
            <Button.Title>Atividades</Button.Title>
          </Button>
          <Button
            variant={option === 'details' ? 'primary' : 'secondary'}
            onPress={() => setOption('details')}
            flex={1}>
            <Info color={option === 'details' ? colors.lime[950] : colors.zinc[200]} size={20} />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editá-la."
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}>
        <View className="my-4 gap-2">
          <Input variant="secondary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Para onde?"
              onChangeText={setDestination}
              value={destination}
            />
          </Input>

          <Input variant="secondary">
            <IconCalendar color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Quando?"
              value={selectedDates.formatDatesInText}
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>

          <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
            <Button.Title>Atualizar</Button.Title>
          </Button>

          <TouchableOpacity activeOpacity={0.8} onPress={handleRemoveTrip}>
            <Text className='text-red-400 text-center mt-6'>Remover viagem</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ida e volta da viagem"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => {
          setShowModal(MODAL.NONE)
        }}>
        <View className="mt-4 gap-4">
          <Calendar
            onDayPress={handleSelectDates}
            markedDates={selectedDates.dates}
            minDate={dayjs().toISOString()}
          />

          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal title="Confirmar presença" visible={showModal === MODAL.CONFIRM_ATTENDANCE}>
        <View className="mt-4 gap-4">
          <Text className="my-2 font-regular leading-6 text-zinc-400">
            Você foi convidado(a) para participar de uma viagem para
            <Text className="font-semibold text-zinc-100"> {tripDetails.destination} </Text>
            nas datas de
            <Text className="font-semibold text-zinc-100">
              {' '}
              {dayjs(tripDetails.starts_at).date()} de {dayjs(tripDetails.ends_at).format('MMMM')} à{' '}
              {dayjs(tripDetails.ends_at).date()} de {dayjs(tripDetails.ends_at).format('MMMM')}.{'\n\n'}
            </Text>
            Para confirmar sua presença na viagem, preencha os dados abaixo:
          </Text>

          <Input variant='secondary'>
            <User color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='Seu nome completo'
              onChangeText={setGuestName}
            />
          </Input>

          <Input variant='secondary'>
            <Mail color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='E-mail de confirmação'
              onChangeText={setGuestEmail}
              value={guestEmail.toLowerCase()}
            />
          </Input>

          <Button isLoading={isConfirmingAttendance} onPress={handleConfirmAttendance}>
            <Button.Title>Confirmar minha presença</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}
