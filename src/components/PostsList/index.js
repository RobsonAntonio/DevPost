import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { Container, Name, Header, Avater, ContentView, Content, Actions, LikeButton, Like, TimePost } from './styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { formatDistance, fromUnixTime } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import firestore from '@react-native-firebase/firestore'


function PostsList({ data, userId }) {
    const [likePost, setLikePost] = useState(data?.likes)
    const navigation = useNavigation();

    async function handleLikePost(id, likes) {
        const docId = `${userId}_${id}`;

        //Checar se o post ja foi curtido
        const doc = await firestore().collection('likes')
            .doc(docId).get();


        if (doc.exists) {
            // Quer dizer que ja curtiu esse post, entao precisamos remover o like
            await firestore().collection('posts')
                .doc(id).update({
                    likes: likes - 1
                })

            await firestore().collection('likes').doc(docId)
                .delete()
                .then(() => {
                    setLikePost(likes - 1)
                })
            return;
        }

        //precisamos dar o like no post
        await firestore().collection('likes')
            .doc(docId).set({
                postId: id,
                userId: userId
            })
        await firestore().collection('posts')
            .doc(id).update({
                likes: likes + 1
            })
            .then(() => {
                setLikePost(likes + 1)
            })
    }

    function formatTimePost() {
        const datePost = new Date(data.created.seconds * 1000);

        return formatDistance(
            new Date(),
            datePost,
            {
                locale: ptBR
            }
        )

    }

    return (
        <Container>
            <Header onPress={() => navigation.navigate("PostsUser", { title: data.autor, userId: data.userId })} >
                {data.avatarUrl ? (
                    <Avater
                        source={{ uri: data.avatarUrl }}
                    />
                ) : (
                    <Avater
                        source={require('../../assets/avatar.png')}
                    />
                )}
                <Name numberOfLines={1}>
                    {data.autor}
                </Name>
            </Header>

            <ContentView>
                <Content>{data?.content}</Content>
            </ContentView>


            <Actions>
                <LikeButton onPress={() => handleLikePost(data.id, likePost)}>
                    <Like>{likePost === 0 ? '' : likePost}</Like>
                    <MaterialCommunityIcons
                        name={likePost === 0 ? "heart-plus-outline" : 'cards-heart'}
                        size={20}
                        color="#E52246"
                    />
                </LikeButton>

                <TimePost>
                    {formatTimePost()}
                </TimePost>

            </Actions>

        </Container>
    );
}

export default PostsList;