# API ในการจัดการระบบฐานข้อมูลของสินทรัพย์

## API ทั้งหมด
1. การร้องขอข้อมูลผู้ใช้โดยใช้ token ("/user/:token" [GET] )
2. การเพิ่มข้อมูลผู้ใช้ใหม่เข้าสู่ฐานข้อมูล ("/user" [POST] )
3. การร้องขอการแก้ไขข้อมูลผู้ใช้เดิม ("/user" [PUT] )
4. การร้องขอการเข้าสู่ระบบ ("/login" [POST] )
5. การร้องขอการแก้ไขคะแนน ("/score/:mode/:difficulty" [POST] )
6. การส่งข้อมูลมาบันทึกบนฐานข้อมูล ("/upload" [POST])
7. การร้องขอไฟล์บนฐานข้อมูล ("/getfile/:filename" [GET])
8. การร้องขอการเรียกใช้โมเดลในการจำแนกเสียงคอร์ดกีต้าร์ ("/model" [POST])

# คำอธิบาย API ต่างๆ
> ## **1. การร้องขอข้อมูลผู้ใช้โดยใช้ token**
> **/user [GET]**

### ข้อมูลที่ต้องส่งมา
- **method** : GET
- **query**
  - token: โทเค็นระบุตัวตนผู้ที่กำลังเข้าใช้งาน

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|-|ข้อมูลจากการถอดรหัส JWT Token|-|
|401|Authentication error|-|Token ไม่ถูกส่งมาหรือไม่ถูกต้อง|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/user/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVGVlbm8iLCJlbWFpbCI6InRpbm9fMDg0NzhAaG90bWFpbC5jb20iLCJpYXQiOjE2ODY3NTY1NTEsImV4cCI6MTY4OTM0ODU1MX0.P0alizt1pBsMCETDBAOmgQ8GQCI6NM4iTbfaMXJsiow

#### Responce: 

```json
{
  "name": "Thitiphat",
  "email": "tino_08478@hotmail.com",
  "iat": 1686762882,
  "exp": 1689354882
}
```
___

> ## **2. การเพิ่มข้อมูลผู้ใช้ใหม่เข้าสู่ฐานข้อมูล**
> **/user [POST]**

### ข้อมูลที่ต้องส่งมา
- **method** : POST
- **body**
  - name: ชื่อผู้ใช้งาน
  - email: อีเมลล์ของผู้ใช้งาน
  - password: รหัสผ่านสำหรับการเข้าสู่ระบบ

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|Success|-|-|
|400|Data Required|-|ข้อมูลไม่ถูกส่งมาหรือส่งมาไม่ครบถ้วน|
|400|Email already exists|-|อีเมลล์ที่ส่งมาถูกใช้งานแล้ว|
|500|API Error|-|มีข้อผิดพลาดบางประการในระบบ|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/user/

#### Responce: 

```json
{
  "status": "Success"
}
```
___

> ## **3. การร้องขอการแก้ไขข้อมูลผู้ใช้เดิม**
> **/user [PUT]**

### ข้อมูลที่ต้องส่งมา
- **method** : PUT
- **body**
  - name: ชื่อผู้ใช้งาน
  - token: โทเค็นระบุตัวตนผู้ที่กำลังเข้าใช้งาน

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|Success|-|-|
|400|Data Required|-|ข้อมูลไม่ถูกส่งมาหรือส่งมาไม่ครบถ้วน|
|401|Authentication Failed|-|อีเมลล์ที่ส่งมาไม่มีอยู่ในระบบ|
|500|API Error|-|มีข้อผิดพลาดบางประการในระบบ|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/user/

#### Responce: 

```json
{
  "status": "Success"
}
```
___

> ## **4. การร้องขอการเข้าสู่ระบบ**
> **/login [POST]**

### ข้อมูลที่ต้องส่งมา
- **method** : POST
- **body**
  - email: อีเมลล์ของผู้ใช้งาน
  - password: รหัสผ่านสำหรับการเข้าสู่ระบบ

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|Login Successfully|token ของผู้ใช้ที่ทำการเข้าสู่ระบบ|-|
|400|Data Required|-|ข้อมูลไม่ถูกส่งมาหรือส่งมาไม่ครบถ้วน|
|401|Authentication Failed|-|เกิดความผิดพลาดในการเข้าสู่ระบบ (ตรวจสอบหัวข้อ Details)|
|500|API Error|-|มีข้อผิดพลาดบางประการในระบบ|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/login/

#### Responce: 

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVGVlbm8iLCJlbWFpbCI6InRpbm8wODQ3OUBnbWFpbC5jb20iLCJpYXQiOjE2ODY3NjY0MjYsImV4cCI6MTY4OTM1ODQyNn0.ZOqBCj_B8so7b7bt3qO9drDwVrcGrieNYPPEh4bHJH4",
  "status": "Login Successfully",
  "detail": "user: Teeno"
}
```
___

> ## **5. การร้องขอการแก้ไขคะแนน**
> **/score" [POST]**

### ข้อมูลที่ต้องส่งมา
- **method** : POST
- **query**
  - mode: อีเมลล์ของผู้ใช้งาน(listening_chord, memorize_chord, playing_chord)
    - difficulty: ระดับความยากในโหมดนั้นๆ(beginner, intermediate, advance)
- **body**
  - token : โทเค็นระบุตัวตนผู้ที่กำลังเข้าใช้งาน
  - score : คะแนนในโหมดนั้นๆ

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|Success|-|-|
|400|Data Required|-|ข้อมูลไม่ถูกส่งมาหรือส่งมาไม่ครบถ้วน|
|400|Mode invalid|-|ค่าในตัวแปร Mode ไม่ถูกต้อง|
|400|Difficulty invalid|-|ค่าในตัวแปร Difficulty ไม่ถูกต้อง|
|401|Authentication Failed|-|อีเมลล์ที่ส่งมาไม่มีอยู่ในระบบ|
|500|API Error|-|มีข้อผิดพลาดบางประการในระบบ|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/score/memorize_chord/intermediate

#### Responce: 

```json
{
  "status": "Success"
}
```
___

> ## **6. การส่งข้อมูลมาบันทึกบนฐานข้อมูล ("/upload" [POST])**
> **/score" [POST]**

### ข้อมูลที่ต้องส่งมา 
- **method** : POST
- **body** (ส่งมาด้วย Formdata)
  - token : ไฟล์เสียงที่ต้องการอัปโหลดลงฐานข้อมูล

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|Success|-|-|
|400|Data Required|-|ข้อมูลไม่ถูกส่งมาหรือส่งมาไม่ครบถ้วน|
|400|Mode invalid|-|ค่าในตัวแปร Mode ไม่ถูกต้อง|
|400|Difficulty invalid|-|ค่าในตัวแปร Difficulty ไม่ถูกต้อง|
|401|Authentication Failed|-|อีเมลล์ที่ส่งมาไม่มีอยู่ในระบบ|
|500|API Error|-|มีข้อผิดพลาดบางประการในระบบ|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/score/memorize_chord/intermediate

#### Responce: 

```json
{
  "status": "Success"
}
```
___

> ## **7. การร้องขอไฟล์บนฐานข้อมูล ("/getfile/:filename" [GET])**
> **/score" [POST]**

### ข้อมูลที่ต้องส่งมา
- **method** : POST
- **query**
  - mode: อีเมลล์ของผู้ใช้งาน(listening_chord, memorize_chord, playing_chord)
    - difficulty: ระดับความยากในโหมดนั้นๆ(beginner, intermediate, advance)
- **body**
  - token : โทเค็นระบุตัวตนผู้ที่กำลังเข้าใช้งาน
  - score : คะแนนในโหมดนั้นๆ

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|Success|-|-|
|400|Data Required|-|ข้อมูลไม่ถูกส่งมาหรือส่งมาไม่ครบถ้วน|
|400|Mode invalid|-|ค่าในตัวแปร Mode ไม่ถูกต้อง|
|400|Difficulty invalid|-|ค่าในตัวแปร Difficulty ไม่ถูกต้อง|
|401|Authentication Failed|-|อีเมลล์ที่ส่งมาไม่มีอยู่ในระบบ|
|500|API Error|-|มีข้อผิดพลาดบางประการในระบบ|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/score/memorize_chord/intermediate

#### Responce: 

```json
{
  "status": "Success"
}
```
___

> ## **8. การร้องขอการเรียกใช้โมเดลในการจำแนกเสียงคอร์ดกีต้าร์ ("/model" [POST])**
> **/score" [POST]**

### ข้อมูลที่ต้องส่งมา
- **method** : POST
- **query**
  - mode: อีเมลล์ของผู้ใช้งาน(listening_chord, memorize_chord, playing_chord)
    - difficulty: ระดับความยากในโหมดนั้นๆ(beginner, intermediate, advance)
- **body**
  - token : โทเค็นระบุตัวตนผู้ที่กำลังเข้าใช้งาน
  - score : คะแนนในโหมดนั้นๆ

### Response ต่างๆ
|HTTP Code|status|Data Response(Variable)|Status Explain|
|:----:|:----:|:----:|:----:|
|200|Success|-|-|
|400|Data Required|-|ข้อมูลไม่ถูกส่งมาหรือส่งมาไม่ครบถ้วน|
|400|Mode invalid|-|ค่าในตัวแปร Mode ไม่ถูกต้อง|
|400|Difficulty invalid|-|ค่าในตัวแปร Difficulty ไม่ถูกต้อง|
|401|Authentication Failed|-|อีเมลล์ที่ส่งมาไม่มีอยู่ในระบบ|
|500|API Error|-|มีข้อผิดพลาดบางประการในระบบ|

### ตัวอย่าง Data Response 

#### URL: http://gt-app.teenots.repl.co/score/memorize_chord/intermediate

#### Responce: 

```json
{
  "status": "Success"
}
```
___