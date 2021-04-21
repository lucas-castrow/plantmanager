import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator
} from 'react-native'
import { EnvironmentButton } from '../components/EnvironmentButton'
import {Header} from '../components/Header'
import { PlantCardPrimary } from '../components/PlantCardPrimary'
import {Load}  from '../components/Load'
import api from '../services/api'

import colors from '../styles/colors'
import fonts from '../styles/fonts'

interface EnvironmentProps{
    key: string,
    title: string
}
interface PlantProps{
    id: string;
    name: string;
    about: string;
    water_tips: string;
    photo: string;
    environments: [string];
    frequency: {
        times: number;
        repeat_every: string;
      }
}
export function PlantSelect(){
    const[environments, setEnvironments] = useState<EnvironmentProps[]>([]);
    const[plants, setPlants] = useState<PlantProps[]>([]);
    const[filterPlants, setFilterPlants] = useState<PlantProps[]>([]);
    const[environmentSelected, setEnvironmentSelected] = useState('all');
    const[loading, setLoading] = useState(true);
    
    const[page, setPage] = useState(1);
    const[loadMore, setLoadMore]  = useState(false);
    const[loadedAll,setLoadedAll] = useState(false);


    async function fetchPlants(){
        const {data} = await api.get(`plants?_sort=name&_order=asc&_page${page}&_limit=8`)
        if(!data){
            return setLoading(true)
        }
        if(page > 1){
            setPlants(oldValue => [...oldValue, ...data])
            setFilterPlants(oldValue => [...oldValue, ...data])
        }else{
            setPlants(data)
            setFilterPlants(data)
        }
        //setPlants(data)
        setLoading(false)
        setLoadMore(false)
    }
    function handleFetchMore(distance: number){
        if(distance < 1)
            return;
        
        setLoadMore(true);
        setPage(oldValue => oldValue + 1)
        fetchPlants()
    }

    function handleEnvironmentSelected(environment: EnvironmentProps){
        setEnvironmentSelected(environment.key)
        
        if(environment.key === 'all'){
            return setFilterPlants(plants);
        }
        const filtered = plants.filter(plant =>
            plant.environments.includes(environment.key)
            )

        setFilterPlants(filtered)

    }
    useEffect(() => {
        async function fetchEnvironment(){
            const {data} = await api.get('plants_environments?_sort=title&_order=asc')
            setEnvironments([
                {
                    key: 'all',
                    title: 'Todos'
                }, 
                ...data 
            ])
        }
        fetchEnvironment();
    },[])

    useEffect(() => {
        fetchPlants();
        
    },[])


    
    if(loading){
        return <Load />
    }
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Header/>
                <Text style={styles.title}>Em qual ambiente</Text>
                <Text style={styles.subtitle}>você quer colocar sua planta?</Text>
            </View>
            <View>
                <FlatList 
                    data={environments}
                    renderItem={({item}) => (
                        <EnvironmentButton 
                            title={item.title}
                            active={item.key === environmentSelected}
                            onPress={() => handleEnvironmentSelected(item)}
                        />       
                    )}
                    horizontal
                    showsHorizontalScrollIndicator = {false}
                    contentContainerStyle={styles.environmentList}
                >
                </FlatList>
            </View>     
            <View style={styles.plants}>
                        <FlatList 
                            data={filterPlants}
                            renderItem={({item}) => (
                                <PlantCardPrimary data={item}/>
                            )}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            onEndReachedThreshold={0.1}
                            onEndReached={({distanceFromEnd}) => handleFetchMore(distanceFromEnd)}
                            ListFooterComponent={
                                loadMore ?
                                    <ActivityIndicator color={colors.green}/>
                                    :<></>
                            }
                            >

                        </FlatList>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: colors.background
    },
    header:{
        paddingHorizontal: 30,
    },
    title:{
        fontSize: 17,
        color: colors.heading,
        fontFamily: fonts.heading,
        lineHeight: 20,
        marginTop: 15,
    },
    subtitle:{
        fontSize: 17,
        fontFamily: fonts.text,
        lineHeight: 20,
        color: colors.heading 
    },
    environmentList:{
        height: 40,
        justifyContent: 'center',
        paddingBottom: 5,
        marginLeft: 32,
        marginVertical: 32,
    },
    plants:{
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'center',
    },
    contentContainerStyle:{
    }
})