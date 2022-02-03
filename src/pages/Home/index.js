import React, { useState, useContext, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AuthContext } from '../../contexts/auth'
import firestore from '@react-native-firebase/firestore'

import { Container, ButtonPost, ListPosts } from './styles';
import Header from '../../components/Header';
import PostsList from '../../components/PostsList';


function Home() {

  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingRefresh, setLoadingRefresh] = useState(false)
  const [lastItem, setLastItem] = useState('');
  const [emptyList, setEmptyList] = useState(false);


  useFocusEffect(
    useCallback(() => {
      let isActive = true;


      function fecthPosts() {
        firestore().collection('posts')
          .orderBy('created', 'desc')
          .limit(5)
          .get()
          .then((snapshot) => {

            if (isActive) {
              setPosts([]);
              const postList = [];

              snapshot.docs.map(conteudo => {
                postList.push({
                  ...conteudo.data(),
                  id: conteudo.id,
                })
              })

              setEmptyList(!!snapshot.empty)
              setPosts(postList);
              setLastItem(snapshot.docs[snapshot.docs.length - 1])
              setLoading(false);

            }

          })
      }
      fecthPosts();

      return () => {
        isActive = false;
      }

    }, [])
  )

  // BUSCAR MAIS POSTS QNDO PUXAR LISTA PRA CIMA
  function handleRefreshPost() {
    setLoadingRefresh(true)

    firestore().collection('posts')
      .orderBy('created', 'desc')
      .limit(5)
      .get()
      .then((snapshot) => {

        setPosts([]);
        const postList = [];

        snapshot.docs.map(conteudo => {
          postList.push({
            ...conteudo.data(),
            id: conteudo.id,
          })
        })

        setEmptyList(false)
        setPosts(postList);
        setLastItem(snapshot.docs[snapshot.docs.length - 1])
        setLoading(false);

      })

    setLoadingRefresh(false)

  }

  // BUSCAR MAIS POSTS AO CHEGAR NO FINAL DA LISTA

  async function getListPosts() {
    if (emptyList) {
      // se buscou toda sua lista tiramos o loading
      setLoading(false);
      return null;
    }
    if (loading) return;

    firestore().collection('posts')
      .orderBy('created', 'desc')
      .limit(5)
      .startAfter(lastItem)
      .get()
      .then((snapshot) => {
        const postList = [];

        snapshot.docs.map(conteudo => {
          postList.push({
            ...conteudo.data(),
            id: conteudo.id,
          })
        })

        setEmptyList(!!snapshot.empty)
        setLastItem(snapshot.docs[snapshot.docs.length - 1])
        setPosts(oldPosts => [...oldPosts, ...postList])
        setLoading(false)

      })

  }

  return (
    <Container>
      <Header />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={50} color="#E52246" />
        </View>
      ) : (

        <ListPosts
          showsVerticalScrollIndicator={false}
          data={posts}
          renderItem={({ item }) => (
            <PostsList
              data={item}
              userId={user?.uid}

            />
          )}

          refreshing={loadingRefresh}
          onRefresh={handleRefreshPost}

          onEndReached={() => getListPosts()}
          onEndReachedThreshold={0.1}
        />

      )}

      <ButtonPost onPress={() => navigation.navigate("NewPost")}>
        <Feather
          name="edit-2"
          color="#FFF"
          size={25}
        />
      </ButtonPost>
    </Container>
  );
}

export default Home;