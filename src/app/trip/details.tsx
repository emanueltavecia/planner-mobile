import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Modal } from '@/components/modal'
import { Participant, ParticipantProps } from '@/components/participant'
import { TripLink, TripLinkProps } from '@/components/tripLink'
import { linksServer } from '@/server/links-server'
import { participantsServer } from '@/server/participants-server'
import { colors } from '@/styles/colors'
import { validateInput } from '@/utils/validateInput'
import { Plus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Alert, FlatList, Text, View } from 'react-native'

interface DetailsProps {
  tripID: string
}

export function Details({ tripID }: DetailsProps) {
  const [showModal, setShowModal] = useState(false)
  const [linkTitle, setLinkTitle] = useState('')
  const [linkURL, setLinkURL] = useState('')
  const [links, setLinks] = useState<TripLinkProps[]>([])
  const [participants, setParticipants] = useState<ParticipantProps[]>([])
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false)

  function resetFields() {
    setLinkTitle('')
    setLinkURL('')
    setShowModal(false)
  }

  async function handleCreateTripLink() {
    try {
      if (!linkTitle.trim()) {
        return Alert.alert('Cadastrar link', 'Preencha todos os campos.')
      }

      if (!validateInput.url(linkURL.trim())) {
        return Alert.alert('Cadastrar link', 'Link inválido')
      }

      setIsCreatingLinkTrip(true)

      await linksServer.create({
        tripId: tripID,
        title: linkTitle,
        url: linkURL,
      })

      Alert.alert('Cadastrar link', 'Link criado com sucesso.')
      resetFields()
      await getTripLinks()
    } catch (error) {
      console.log(error)
    } finally {
      setIsCreatingLinkTrip(false)
    }
  }

  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripID)
      setLinks(links)
    } catch (error) {
      console.log(error)
    }
  }

  async function getTripParticipants() {
    try {
      const participants = await participantsServer.getByTripId(tripID)
      setParticipants(participants)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getTripLinks()
    getTripParticipants()
  }, [])

  return (
    <View className="mt-10 flex-1">
      <Text className="mb-2 font-semibold text-2xl text-zinc-50">Links importantes</Text>

      <View className="flex-1">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="mb-6 mt-2 font-regular text-base text-zinc-400">
            Nenhum link adicionado
          </Text>
        )}
        <Button variant="secondary" onPress={() => setShowModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className="mt-6 flex-1 border-t border-zinc-800">
        <Text className="my-6 font-semibold text-2xl text-zinc-50">Convidados</Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-36"
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes"
        visible={showModal}
        onClose={() => setShowModal(false)}>
        <View className="mb-2 gap-2">
          <Input variant="secondary">
            <Input.Field
              placeholder="Título do link"
              onChangeText={setLinkTitle}
              value={linkTitle}
            />
          </Input>
          <Input variant="secondary">
            <Input.Field placeholder="URL" onChangeText={setLinkURL} value={linkURL} />
          </Input>
        </View>

        <Button isLoading={isCreatingLinkTrip} onPress={handleCreateTripLink}>
          <Button.Title>Salvar link</Button.Title>
        </Button>
      </Modal>
    </View>
  )
}
