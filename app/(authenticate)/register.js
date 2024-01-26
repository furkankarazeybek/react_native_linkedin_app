import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Entypo } from '@expo/vector-icons';
import axios from "axios";

const register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name,setName] = useState("");
  const [image,setImage] = useState("");
  const router = useRouter();
  const handleRegister = () => {
    const user = {
      name:name,
      email:email,
      password: password,
      profileImage: image
    }

    console.log(name,"isim")

    axios.post("https://stupid-frogs-tell.loca.lt/register",user, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      console.log(response);
      Alert.alert("Kayıt Başarılı","Başarıyla kayıt oldunuz!",[{ text: "OK" }]);
      setName("");
      setEmail("");
      setPassword("");
      setImage("");
    }).catch((error) => {
      Alert.alert("Kayıt Hatası","Bir hata meydana geldi!",error);
      console.log("registration failed",error)
    })
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <View>
        <Image
          style={{ width: 150, height: 100, resizeMode: "contain" }}
          source={{
            uri: "https://www.freepnglogos.com/uploads/linkedin-logo-transparent-png-25.png",
          }}
        />
      </View>

      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "bold",
              marginTop: 12,
              color: "#041E42",
            }}
          >
           Hesap Oluştur
          </Text>
        </View>

         

      

        <View style={{ marginTop: 20 }}>

        <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#E0E0E0",
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 30,
            }}
          >
              <Ionicons 
              style={{ marginLeft: 8}} 
              name="ios-person" 
              size={24} 
              color="gray" />
    
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: name ? 18 : 18,
              }}
              placeholder="Ad Soyad"
              />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#E0E0E0",
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 30,
            }}
          >
            <MaterialIcons
              style={{ marginLeft: 8 }}
              name="email"
              size={24}
              color="gray"
            />

            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: email ? 18 : 18,
              }}
              placeholder="E-posta adresiniz"
            />
          </View>

          <View >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#E0E0E0",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 30,
              }}
            >
              <AntDesign
                style={{ marginLeft: 8 }}
                name="lock1"
                size={24}
                color="gray"
              />
              <TextInput
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                style={{
                  color: "gray",
                  marginVertical: 10,
                  width: 300,
                  fontSize: password ? 18 : 18,
                }}
                placeholder="Şifreniz"
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#E0E0E0",
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 30,
            }}
          >

              <Entypo 
              style={{ marginLeft: 8}} 
              name="image" 
              size={24} 
              color="gray" />
    
            <TextInput
              value={image}
              onChangeText={(text) => setImage(text)}
              style={{
                color: "gray",
                marginVertical: 10,
                width: 300,
                fontSize: image ? 18 : 18,
              }}
              placeholder="Resim Yükle"
              />
          </View>

          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* <Text>Beni hatırla</Text> */}

            <Text style={{ color: "#007FFF", fontWeight: "500" }}>
              Şifremi Unuttum
            </Text>
          </View>

          <View style={{ marginTop: 30 }} />

          <Pressable
          onPress={handleRegister}
            style={{
              width: 200,
              backgroundColor: "#0072b1",
              borderRadius: 6,
              marginLeft: "auto",
              marginRight: "auto",
              padding: 15,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Kayıt Ol
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/login")} style={{ marginTop: 15 }}>
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
              Hesabın var mı ? Giriş Yap
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default register;

const styles = StyleSheet.create({});
