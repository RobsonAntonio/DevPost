import React, { useContext, useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'

import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage';


import { AuthContext } from '../../contexts/auth'
import {
  ButtonText, Container, Email, Name, Button, UpLoadButton,
  UpLoadText, Avatar, ModalContainer, ButtonBack, Input
} from './styles'

import Header from '../../components/Header';
import Feather from 'react-native-vector-icons/Feather'


function Profile() {
  const { signOut, user, setUser, storageUser } = useContext(AuthContext)

  const [nome, setNome] = useState(user?.nome)
  const [url, setUrl] = useState(null);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    let isActive = true;

    async function loadAvatar() {
      try {
        if(isActive){

          let response = await storage().ref('users').child(user?.uid).getDownloadURL();
          setUrl(response);

        }
      } catch (error) {
        console.log('NÃO ENCONTRAMOS NENHUMA FOTO')
      }
    }
    loadAvatar();

    return () => isActive = false;
  }, [])


  // atualizar perfil
  async function updateProfile() {
    if (nome === '') {
      return;
    }
    await firestore().collection('users')
      .doc(user?.uid)
      .update({
        nome: nome
      })
    // buscar todos posts desse user e atualizar o nome dele
    const postDocs = await firestore().collection('posts')
      .where('userId', '==', user?.uid).get();

    //percorrer todos posts desse user e atualizar
    postDocs.forEach(async doc => {
      await firestore().collection('posts').doc(doc.id)
        .update({
          autor: nome
        })
    })

    let data = {
      uid: user.uid,
      nome: nome,
      email: user.email,
    }
    setUser(data);
    storageUser(data);
    setOpen(false);
  }


  async function handleSignOut() {
    await signOut();
  }


  //ABRIR IMAGEM DA GALERIA
  const uploadFile = () => {
    const options = {
      noData: true,
      mediaType: 'photo'
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log("Cancelou!");
      } else if (response.error) {
        console.log("Ops parece que deu algum erro")
      } else {
        uploadFileFirebase(response)
          .then(() => {
            uploadAvatarPosts();
          })

        setUrl(response.assets[0].uri)
      }
    })
  }

  //EXTRAIR E RETORNAR A URL DA FOTO
  const getFileLocalPath = (response) => {
    return response.assets[0].uri;
  }


  //ENVIAR IMAGEM PARA O FIREBASE
  const uploadFileFirebase = async (response) => {
    const fileSource = getFileLocalPath(response)

    //CRIAR UMA PASTA NO FIREBASE STORAGE
    const storageRef = storage().ref('users').child(user?.uid);

    //ENVIAR A FOTO SELECIONADA
    return await storageRef.putFile(fileSource)

  }

  const uploadAvatarPosts = async () => {
    const storageRef = storage().ref('users').child(user?.uid);
    const url = await storageRef.getDownloadURL()
      .then(async (image) => {
        console.log('url recebida', image)

        //ATUALIZAR TODAS IMAGENS DOS POSTS DESSE USER
        const postDocs = await firestore().collection('posts')
          .where('userId', '==', user.uid).get();

        //PERCORRER TODOS POSTS E TROCAR A URL DA IMAGEM
        postDocs.forEach(async doc => {
          await firestore().collection('posts').doc(doc.id).update({
            avatarUrl: image
          })
        })

      })
      .catch((error) => {
        console.log('ERROR AO ATUALIZAR FOTO DOS POSTS ', error)
      })
  }



  return (
    <Container>
      <Header />

      {url ? (
        <UpLoadButton onPress={() => uploadFile()}>
          <UpLoadText>+</UpLoadText>
          <Avatar
            source={{ uri: url }}
          />
        </UpLoadButton>
      ) : (
        <UpLoadButton onPress={() => uploadFile()}>
          <UpLoadText>+</UpLoadText>
        </UpLoadButton>
      )

      }

      <Name>{user?.nome}</Name>
      <Email>{user?.email}</Email>

      <Button bg="#428cfd" onPress={() => setOpen(true)}>
        <ButtonText color="#FFF">Atualizar Perfil</ButtonText>
      </Button>


      <Button bg="#DDD" onPress={handleSignOut}>
        <ButtonText color="#353840">Sair</ButtonText>
      </Button>

      <Modal visible={open} animationType="slide" transparent={true} >
        <ModalContainer>
          <ButtonBack onPress={() => setOpen(false)}>
            <Feather
              name="arrow-left"
              size={22}
              color="#121212"
            />
            <ButtonText color="#121212">Voltar</ButtonText>
          </ButtonBack>

          <Input
            placeholder={user?.nome}
            value={nome}
            onChangeText={(text) => setNome(text)}
          />
          <Button bg="#428cfd" onPress={updateProfile}>
            <ButtonText color="#FFF">Salvar</ButtonText>
          </Button>

        </ModalContainer>

      </Modal>

    </Container>
  );
}

export default Profile;