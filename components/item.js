import { View, Text, Image,ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { router } from 'expo-router';
import { Storage } from 'expo-sqlite/kv-store';
import * as SQLite from 'expo-sqlite';


const Item = (props) => {
    let code_tmp = props.code;
    var code_final = code_tmp;
    if(code_tmp.includes('-') || code_tmp.includes(' '))
    {
        code_final = code_tmp.split("-").join("");
        code_final = code_final.split(" ").join("");
    }
    const thumb = props.thumb;
    const [video_available,setVideo_available] = useState(false);
    const [loading , setLoading] = useState(false);
    const [data , setData] = useState(null);
    const lowerCode = code_final.toLowerCase();
       
    async function get_video_data(){
        try {
            // console.log("getting video data from local storage...",code_tmp)
            const result_code = await Storage.getItem(code_tmp);
            // if(result_code)
            // {
                // // console.log(result_code)
                setData(JSON.parse(result_code));
                setVideo_available(true);
                // console.log("found local data!!");
            // }
            // else{
            //     // console.log("Did not found!!");
                
            // }
        } catch (error) {
            // console.log("error msg:",error);
        }

    }
    // delete check kar aur phir se ipx169 load karo.....
    async function fetchData(){
        setLoading(true);
        const response = await axios.get(`https://rn-jv.mytyper.workers.dev/code/${lowerCode}`);
        const result = response.data;
        if(result.status == 404)
        {
            // console.log(lowerCode,"Code not Found!!!");
            return;
        }
        setLoading(false);
        setData(result);
        // console.log("Api call");
        let code_lists = await Storage.getItem("code_list");
        
        let jav_codes = code_lists.split(",");
        
        
        // // console.log(code_lists)
        if(!jav_codes.includes(result.id))
            jav_codes = [...jav_codes,result.id];
        await Storage.setItem("code_list",jav_codes.join(","));
        await Storage.setItem(result.id,JSON.stringify(result));
        // // console.log("Fetched Data of ",code_tmp)
    }
    	
    // async function checkprac()
    // {
    //     await Storage.removeItem(code_tmp);
    // }

    useEffect(()=>{

        get_video_data();
        if(!video_available)
        {
            // console.log("Video not available had to fetch data")
            fetchData();  
        }
        // checkprac()

    },[code_tmp])
  return (
    //  loading ? (<Text>Loading...........</Text>)
    //     :
        
        <View className={`${thumb ? 'w-[calc(48%)]' : 'w-full'} rounded-lg overflow-hidden bg-black h-auto mb-4 `} onTouchEnd={()=>{
                      router.push(`/code/${code_tmp}`)
                  }}>
            {    
            
              thumb ?
                (
                    <View className="w-fit rounded-t-xl overflow-hidden h-fit p-1">
                    { loading ? 
                        <View>
                            <View className="flex items-center justify-center w-full h-72 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
                                <ActivityIndicator size="large" color="#d1d5db" />
                            </View>
                        </View> 
                    :
                        <View>
                            <Image className=" rounded-t-xl " width={'auto'} height={248} resizeMode='contain' source={{uri : data?.poster_thumb ? data?.poster_thumb : '../assets/nores-removebg-preview.png'}} ></Image>
                            <Text style={{'color':'white'}} numberOfLines={2} className="p-1 font-bold ">{data?.id}  {data?.title?.length && data?.title }</Text>
                        </View>
                     }   
                    </View>
                    )
                :( loading ? 
                    (
                <View>
                    <View className="flex items-center justify-center w-full p-4 h-64 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
                        <ActivityIndicator size="large" color="#d1d5db" />
                    </View>
                </View> ) : (
                    <View  className="w-fit rounded-t-xl overflow-hidden h-fit p-1 " >
                        <Image className=" rounded-t-xl " width={'auto'} height={248} resizeMode='contain' source={{uri : data?.poster}} ></Image>
                        <Text numberOfLines={2} style={{'color':'white'}} className="p-1 font-bold ">{data?.id}  {data?.title?.length && data?.title }</Text>
                    </View>))
            }
            
        </View>
    
    
  )
}

export default Item