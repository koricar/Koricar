import { Router, type IRouter } from "express";
import { SearchCarsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const carCache = new Map<string, ReturnType<typeof mapEncarCar>>();

const ENCAR_API = "https://api.encar.com";
const ENCAR_PHOTO = "https://ci.encar.com";
const ENCAR_DETAIL = "https://www.encar.com/dc/dc_cardetailview.do?carid=";

const MANUFACTURER_TO_EN: Record<string, string> = {
  "현대": "Hyundai",
  "기아": "Kia",
  "제네시스": "Genesis",
  "쌍용": "SsangYong",
  "KG모빌리티": "KG Mobility",
  "르노삼성": "Renault Samsung",
  "르노코리아": "Renault Korea",
  "쉐보레": "Chevrolet",
  "쉐보레(GM대우)": "Chevrolet",
  "BMW": "BMW",
  "벤츠": "Mercedes-Benz",
  "아우디": "Audi",
  "폭스바겐": "Volkswagen",
  "볼보": "Volvo",
  "도요타": "Toyota",
  "혼다": "Honda",
  "닛산": "Nissan",
  "렉서스": "Lexus",
  "포르쉐": "Porsche",
  "랜드로버": "Land Rover",
  "재규어": "Jaguar",
  "미니": "MINI",
  "포드": "Ford",
  "지프": "Jeep",
  "링컨": "Lincoln",
  "캐딜락": "Cadillac",
  "인피니티": "Infiniti",
  "마세라티": "Maserati",
  "페라리": "Ferrari",
  "람보르기니": "Lamborghini",
};

const EN_TO_MANUFACTURER: Record<string, string> = {
  "hyundai": "현대",
  "kia": "기아",
  "genesis": "제네시스",
  "ssangyong": "쌍용",
  "kg mobility": "KG모빌리티",
  "renault samsung": "르노삼성",
  "renault korea": "르노코리아",
  "chevrolet": "쉐보레(GM대우)",
  "bmw": "BMW",
  "mercedes": "벤츠",
  "mercedes-benz": "벤츠",
  "audi": "아우디",
  "volkswagen": "폭스바겐",
  "volvo": "볼보",
  "toyota": "도요타",
  "honda": "혼다",
  "lexus": "렉서스",
  "nissan": "닛산",
  "infiniti": "인피니티",
  "porsche": "포르쉐",
  "land rover": "랜드로버",
  "jaguar": "재규어",
  "mini": "미니",
  "ford": "포드",
  "jeep": "지프",
  "lincoln": "링컨",
  "cadillac": "캐딜락",
  "ferrari": "페라리",
  "lamborghini": "람보르기니",
  "maserati": "마세라티",
  "rolls-royce": "롤스로이스",
  "mclaren": "맥라렌",
};

const DOMESTIC_BRANDS = new Set([
  "hyundai", "kia", "genesis", "ssangyong", "kg mobility",
  "renault samsung", "renault korea", "chevrolet",
]);

const FUEL_TO_EN: Record<string, string> = {
  "가솔린": "gasoline",
  "디젤": "diesel",
  "LPG": "lpg",
  "전기": "electric",
  "수소": "hydrogen",
  "가솔린+전기": "hybrid",
  "디젤+전기": "hybrid",
  "플러그인하이브리드": "hybrid",
  "가솔린+LPG": "lpg",
};

const EN_TO_FUEL_KR: Record<string, string> = {
  "gasoline": "가솔린",
  "diesel": "디젤",
  "lpg": "LPG",
  "electric": "전기",
  "hybrid": "가솔린+전기",
};

const EN_TO_TRANSMISSION_KR: Record<string, string> = {
  "auto": "오토",
  "manual": "수동",
};

const MODEL_GROUP_MAP: Record<string, string> = {
  // HYUNDAI
  "아반떼": "아반떼",
  "아반떼 (CN7)": "아반떼",
  "아반떼 하이브리드 (CN7)": "아반떼",
  "아반떼 MD": "아반떼",
  "쏘나타": "쏘나타",
  "쏘나타 (DN8)": "쏘나타",
  "쏘나타 하이브리드 (DN8)": "쏘나타",
  "LF 쏘나타": "쏘나타",
  "그랜저": "그랜저",
  "그랜저 (GN7)": "그랜저",
  "그랜저 하이브리드 (GN7)": "그랜저",
  "더 뉴 그랜저 IG": "그랜저",
  "그랜저 HG": "그랜저",
  "투싼": "투싼",
  "투싼 (NX4)": "투싼",
  "더 뉴 투싼 TL": "투싼",
  "싼타페": "싼타페",
  "싼타페 (MX5)": "싼타페",
  "더 뉴 싼타페": "싼타페",
  "싼타페 TM": "싼타페",
  "팰리세이드": "팰리세이드",
  "더 뉴 팰리세이드": "팰리세이드",
  "코나": "코나",
  "코나 (OS)": "코나",
  "코나 (SX2)": "코나",
  "아이오닉 5": "아이오닉 5",
  "아이오닉 5 N": "아이오닉 5",
  "아이오닉 6": "아이오닉 6",
  "아이오닉 9": "아이오닉 9",
  "아이오닉": "아이오닉",
  "스타리아": "스타리아",
  "스타리아 라운지": "스타리아",
  "스타렉스": "스타렉스",
  "더 뉴 그랜드 스타렉스": "스타렉스",
  "넥쏘": "넥쏘",
  "베뉴": "베뉴",
  "캐스퍼": "캐스퍼",
  "캐스퍼 일렉트릭": "캐스퍼",
  "엑센트": "엑센트",
  "벨로스터": "벨로스터",
  "포터": "포터",
  "포터 2": "포터",
  // KIA
  "K3": "K3",
  "더 뉴 K3 2세대": "K3",
  "K5": "K5",
  "K5 3세대": "K5",
  "K5 하이브리드 3세대": "K5",
  "더 뉴 K5 2세대": "K5",
  "K8": "K8",
  "K8 하이브리드": "K8",
  "K9": "K9",
  "스팅어": "스팅어",
  "스포티지": "스포티지",
  "스포티지 5세대": "스포티지",
  "스포티지 5세대 하이브리드": "스포티지",
  "스포티지 5세대 플러그인 하이브리드": "스포티지",
  "쏘렌토": "쏘렌토",
  "쏘렌토 4세대": "쏘렌토",
  "쏘렌토 하이브리드 4세대": "쏘렌토",
  "쏘렌토 플러그인 하이브리드 4세대": "쏘렌토",
  "더 뉴 쏘렌토 4세대": "쏘렌토",
  "텔루라이드": "텔루라이드",
  "모하비": "모하비",
  "더 뉴 모하비": "모하비",
  "모하비 더 마스터": "모하비",
  "셀토스": "셀토스",
  "더 뉴 셀토스": "셀토스",
  "니로": "니로",
  "디 올 뉴 니로": "니로",
  "니로 하이브리드": "니로",
  "니로 EV": "니로",
  "쏘울": "쏘울",
  "카니발": "카니발",
  "카니발 4세대": "카니발",
  "올 뉴 카니발": "카니발",
  "더 뉴 카니발": "카니발",
  "카니발 리무진": "카니발",
  "모닝": "모닝",
  "레이": "레이",
  "EV3": "EV3",
  "EV6": "EV6",
  "EV6 GT": "EV6",
  "EV9": "EV9",
  // GENESIS
  "G70": "G70",
  "더 뉴 G70": "G70",
  "G70 2세대": "G70",
  "G80": "G80",
  "G80 (RG3)": "G80",
  "G80 전동화": "G80",
  "G90": "G90",
  "G90 (RS4)": "G90",
  "EQ900": "EQ900",
  "GV60": "GV60",
  "GV60 스포츠 플러스": "GV60",
  "GV70": "GV70",
  "GV70 전동화": "GV70",
  "GV80": "GV80",
  "GV80 쿠페": "GV80",
  // CHEVROLET
  "트레일블레이저": "트레일블레이저",
  "더 뉴 트레일블레이저": "트레일블레이저",
  "트랙스": "트랙스",
  "트랙스 크로스오버": "트랙스",
  "말리부": "말리부",
  "스파크": "스파크",
  "이쿼녹스": "이쿼녹스",
  "이쿼녹스 EV": "이쿼녹스",
  "콜로라도": "콜로라도",
  "트래버스": "트래버스",
  "타호": "타호",
  "올란도": "올란도",
  "캡티바": "캡티바",
  "블레이저 EV": "블레이저 EV",
  // RENAULT
  "QM6": "QM6",
  "QM6 LPe": "QM6",
  "SM6": "SM6",
  "XM3": "XM3",
  "아르카나": "XM3",
  "SM3": "SM3",
  "SM5": "SM5",
  "SM7": "SM7",
  "QM3": "QM3",
  "QM5": "QM5",
  "필랑트": "필랑트",
  // SSANGYONG / KGM
  "렉스턴": "렉스턴",
  "렉스턴 G4": "렉스턴",
  "렉스턴 스포츠": "렉스턴",
  "렉스턴 스포츠 칸": "렉스턴",
  "코란도": "코란도",
  "코란도 이모션": "코란도",
  "티볼리": "티볼리",
  "티볼리 에어": "티볼리",
  "무쏘": "무쏘",
  "토레스": "토레스",
  "토레스 EVX": "토레스",
  "액티언": "액티언",
  "액티언 스포츠": "액티언",
  // BMW
  "3시리즈": "3시리즈",
  "5시리즈": "5시리즈",
  "7시리즈": "7시리즈",
  "X3": "X3",
  "X5": "X5",
  "X6": "X6",
  "X7": "X7",
  // MERCEDES
  "C클래스": "C클래스",
  "E클래스": "E클래스",
  "S클래스": "S클래스",
  "GLE": "GLE",
  "GLC": "GLC",
  "GLS": "GLS",
  // TOYOTA
  "캠리": "캠리",
  "RAV4": "RAV4",
  "프리우스": "프리우스",
  "알파드": "알파드",
  "랜드크루저": "랜드크루저",
  // PORSCHE
  "카이엔": "카이엔",
  "마칸": "마칸",
  "파나메라": "파나메라",
  "타이칸": "타이칸",
  // LAND ROVER
  "레인지로버": "레인지로버",
  "레인지로버 스포츠": "레인지로버 스포츠",
  "디스커버리": "디스커버리",
  "디펜더": "디펜더",
};

const EN_MODEL_TO_KR: Record<string, string> = {
  // HYUNDAI
  "avante": "아반떼", "elantra": "아반떼",
  "아반떼": "아반떼", "ألانترا": "아반떼", "ايلانترا": "아반떼",
  "sonata": "쏘나타", "쏘나타": "쏘나타",
  "سوناتا": "쏘나타", "سونانتا": "쏘나타",
  "grandeur": "그랜저", "그랜저": "그랜저",
  "جرانديور": "그랜저", "جراندور": "그랜저",
  "accent": "엑센트", "verna": "엑센트", "엑센트": "엑센트", "اكسنت": "엑센트",
  "tucson": "투싼", "투싼": "투싼", "توسان": "투싼", "تيوسون": "투싼",
  "santa fe": "싼타페", "santafe": "싼타페", "싼타페": "싼타페",
  "سانتافي": "싼타페", "سانتا في": "싼타페",
  "palisade": "팰리세이드", "팰리세이드": "팰리세이드",
  "باليسيد": "팰리세이드", "بالسيد": "팰리세이드", "باليسايد": "팰리세이드",
  "kona": "코나", "코나": "코나", "كونا": "코나",
  "nexo": "넥쏘", "넥쏘": "넥쏘",
  "venue": "베뉴", "베뉴": "베뉴",
  "staria": "스타리아", "스타리아": "스타리아", "ستاريا": "스타리아",
  "starex": "스타렉스", "스타렉스": "스타렉스", "ستاريكس": "스타렉스",
  "ioniq": "아이오닉", "ioniq 5": "아이오닉 5", "ioniq5": "아이오닉 5",
  "ioniq 6": "아이오닉 6", "ioniq6": "아이오닉 6",
  "아이오닉": "아이오닉", "아이오닉 5": "아이오닉 5", "아이오닉 6": "아이오닉 6",
  "ايونيك": "아이오닉", "ايونيك 5": "아이오닉 5", "ايونيك 6": "아이오닉 6", "ايونق": "아이오닉",
  "porter": "포터", "포터": "포터",
  "casper": "캐스퍼", "캐스퍼": "캐스퍼", "كاسبر": "캐스퍼",
  "veloster": "벨로스터", "벨로스터": "벨로스터",
  // KIA
  "k3": "K3", "k5": "K5", "k8": "K8", "k9": "K9",
  "K3": "K3", "K5": "K5", "K8": "K8", "K9": "K9",
  "كي3": "K3", "كي5": "K5", "كي8": "K8", "كي9": "K9",
  "stinger": "스팅어", "스팅어": "스팅어", "ستينجر": "스팅어",
  "sportage": "스포티지", "스포티지": "스포티지",
  "سبورتاج": "스포티지", "سبورتيج": "스포티지",
  "sorento": "쏘렌토", "쏘렌토": "쏘렌토",
  "سورينتو": "쏘렌토", "سورنتو": "쏘렌토",
  "telluride": "텔루라이드", "텔루라이드": "텔루라이드", "تيلورايد": "텔루라이드",
  "mohave": "모하비", "모하비": "모하비", "موهابي": "모하비",
  "mohave the master": "모하비", "모하비 더 마스터": "모하비",
  "the new mohave": "모하비", "더 뉴 모하비": "모하비",
  "seltos": "셀토스", "셀토스": "셀토스", "سيلتوس": "셀토스",
  "niro": "니로", "니로": "니로", "نيرو": "니로",
  "soul": "쏘울", "쏘울": "쏘울", "سول": "쏘울",
  "carnival": "카니발", "sedona": "카니발", "카니발": "카니발",
  "كارنيفال": "카니발", "كرنفال": "카니발", "كرنيفال": "카니발",
  "morning": "모닝", "모닝": "모닝",
  "ray": "레이", "레이": "레이",
  "ev6": "EV6", "ev9": "EV9", "EV6": "EV6", "EV9": "EV9",
  // GENESIS
  "g70": "G70", "g80": "G80", "g90": "G90",
  "gv60": "GV60", "gv70": "GV70", "gv80": "GV80", "gv90": "GV90",
  "G70": "G70", "G80": "G80", "G90": "G90",
  "GV60": "GV60", "GV70": "GV70", "GV80": "GV80", "GV90": "GV90",
  "جي70": "G70", "جي80": "G80", "جي90": "G90",
  "جي في 80": "GV80", "جي في 70": "GV70", "جي في 60": "GV60",
  // SSANGYONG
  "rexton": "렉스턴", "렉스턴": "렉스턴", "ركستون": "렉스턴",
  "korando": "코란도", "코란도": "코란도", "كورندو": "코란도",
  "tivoli": "티볼리", "티볼리": "티볼리", "تيفولي": "티볼리",
  "musso": "무쏘", "무쏘": "무쏘", "موسو": "무쏘",
  "actyon": "액티언", "액티언": "액티언",
  "torres": "토레스", "토레스": "토레스", "تورس": "토레스",
  "rodius": "로디우스", "로디우스": "로디우스",
  // RENAULT
  "sm3": "SM3", "sm5": "SM5", "sm6": "SM6", "sm7": "SM7",
  "SM3": "SM3", "SM5": "SM5", "SM6": "SM6", "SM7": "SM7",
  "qm3": "QM3", "qm5": "QM5", "qm6": "QM6",
  "QM3": "QM3", "QM5": "QM5", "QM6": "QM6",
  "xm3": "XM3", "XM3": "XM3", "arkana": "XM3",
  "philante": "필랑트", "필랑트": "필랑트",
  // CHEVROLET
  "malibu": "말리부", "말리부": "말리부", "ماليبو": "말리부",
  "trax": "트랙스", "트랙스": "트랙스", "تراكس": "트랙스",
  "trailblazer": "트레일블레이저", "트레일블레이저": "트레일블레이저",
  "تريلبليزر": "트레일블레이저",
  "spark": "스파크", "스파크": "스파크", "سبارك": "스파크",
  "equinox": "이쿼녹스", "이쿼녹스": "이쿼녹스",
  "colorado": "콜로라도", "콜로라도": "콜로라도",
  "traverse": "트래버스", "트래버스": "트래버스",
  "tahoe": "타호", "타호": "타호", "تاهو": "타호",
  // BMW
  "3 series": "3시리즈", "3series": "3시리즈", "3시리즈": "3시리즈",
  "320i": "3시리즈", "330i": "3시리즈", "320d": "3시리즈",
  "5 series": "5시리즈", "5series": "5시리즈", "5시리즈": "5시리즈",
  "520i": "5시리즈", "530i": "5시리즈", "530d": "5시리즈",
  "7 series": "7시리즈", "7시리즈": "7시리즈",
  "x1": "X1", "x2": "X2", "x3": "X3", "x4": "X4",
  "x5": "X5", "x6": "X6", "x7": "X7",
  "X1": "X1", "X3": "X3", "X5": "X5", "X6": "X6", "X7": "X7",
  "m3": "M3", "m4": "M4", "m5": "M5", "M3": "M3", "M5": "M5",
  "i3": "i3", "i4": "i4", "i5": "i5", "i7": "i7", "ix": "iX",
  "بي ام 3": "3시리즈", "بي ام 5": "5시리즈",
  "بي ام x5": "X5", "بي ام x3": "X3",
  // MERCEDES-BENZ
  "c class": "C클래스", "c-class": "C클래스", "C클래스": "C클래스",
  "c200": "C클래스", "c300": "C클래스", "c220": "C클래스",
  "e class": "E클래스", "e-class": "E클래스", "E클래스": "E클래스",
  "e300": "E클래스", "e350": "E클래스", "e220": "E클래스",
  "s class": "S클래스", "s-class": "S클래스", "S클래스": "S클래스",
  "gle": "GLE", "glc": "GLC", "gls": "GLS", "glb": "GLB", "gla": "GLA",
  "GLE": "GLE", "GLC": "GLC", "GLS": "GLS",
  "a class": "A클래스", "A클래스": "A클래스",
  "cla": "CLA", "cls": "CLS", "CLA": "CLA", "CLS": "CLS",
  "eqe": "EQE", "eqs": "EQS", "eqb": "EQB",
  "مرسيدس c": "C클래스", "مرسيدس e": "E클래스",
  "جي إل إي": "GLE", "جي إل سي": "GLC",
  // AUDI
  "a3": "A3", "a4": "A4", "a5": "A5", "a6": "A6", "a7": "A7", "a8": "A8",
  "A3": "A3", "A4": "A4", "A5": "A5", "A6": "A6",
  "q3": "Q3", "q5": "Q5", "q7": "Q7", "q8": "Q8",
  "Q3": "Q3", "Q5": "Q5", "Q7": "Q7", "Q8": "Q8",
  "e-tron": "e-tron", "etron": "e-tron",
  "rs6": "RS6", "rs7": "RS7", "rs3": "RS3",
  "اودي a6": "A6", "اودي q7": "Q7", "اودي q5": "Q5",
  // VOLKSWAGEN
  "golf": "골프", "골프": "골프", "جولف": "골프",
  "tiguan": "티구안", "티구안": "티구안", "تيجوان": "티구안",
  "passat": "파사트", "파사트": "파사트", "باسات": "파사트",
  "touareg": "투아렉", "투아렉": "투아렉", "توارك": "투아렉",
  "polo": "폴로", "폴로": "폴로",
  "arteon": "아테온", "아테온": "아테온",
  "id.4": "ID.4", "id4": "ID.4",
  // VOLVO
  "xc40": "XC40", "xc60": "XC60", "xc90": "XC90",
  "XC40": "XC40", "XC60": "XC60", "XC90": "XC90",
  "s60": "S60", "s90": "S90", "S60": "S60", "S90": "S90",
  "v60": "V60", "v90": "V90",
  "ex30": "EX30", "ex40": "EX40", "ex90": "EX90",
  "فولفو xc90": "XC90", "فولفو xc60": "XC60",
  // TOYOTA
  "camry": "캠리", "캠리": "캠리", "كامري": "캠리", "كامرى": "캠리",
  "rav4": "RAV4", "RAV4": "RAV4", "راف4": "RAV4", "راف 4": "RAV4",
  "prius": "프리우스", "프리우스": "프리우스",
  "برايوس": "프리우스", "بريوس": "프리우스",
  "sienna": "시에나", "시에나": "시에나", "سيينا": "시에나",
  "avalon": "아발론", "아발론": "아발론",
  "alphard": "알파드", "알파드": "알파드", "الفارد": "알파드",
  "vellfire": "벨파이어", "벨파이어": "벨파이어",
  "crown": "크라운 크로스오버", "크라운": "크라운 크로스오버",
  "land cruiser": "랜드크루저", "랜드크루저": "랜드크루저", "لاندكروزر": "랜드크루저",
  "highlander": "하이랜더", "하이랜더": "하이랜더",
  "gr86": "GR86", "GR86": "GR86",
  "supra": "GR 수프라",
  // LEXUS
  "es300h": "ES300h 7세대", "es300": "ES300h 7세대", "es350": "뉴 ES350",
  "rx450h": "RX450h 4세대", "rx350": "RX350",
  "nx300h": "NX300h", "nx350h": "NX350h 2세대", "nx450h": "NX450h+ 2세대",
  "is250": "IS250", "is300h": "IS300h",
  "ls500h": "LS500h 5세대", "ls460": "LS460",
  "ux250h": "UX250h", "ct200h": "CT200h",
  "lc500": "LC500",
  "لكزس": "ES300h 7세대",
  "لكزس es": "ES300h 7세대", "لكزس rx": "RX350",
  "لكزس nx": "NX350h 2세대", "لكزس is": "IS300h",
  // PORSCHE
  "cayenne": "카이엔", "카이엔": "카이엔", "كايين": "카이엔",
  "macan": "마칸", "마칸": "마칸", "ماكان": "마칸",
  "panamera": "파나메라", "파나메라": "파나메라",
  "باناميرا": "파나메라", "بانامير": "파나메라",
  "taycan": "타이칸", "타이칸": "타이칸", "تايكان": "타이칸",
  "911": "911", "boxster": "박스터", "cayman": "케이맨",
  // LAND ROVER
  "range rover": "레인지로버", "레인지로버": "레인지로버",
  "رنج روفر": "레인지로버", "رينج روفر": "레인지로버",
  "range rover sport": "레인지로버 스포츠", "레인지로버 스포츠": "레인지로버 스포츠",
  "رنج روفر سبورت": "레인지로버 스포츠",
  "evoque": "레인지로버 이보크", "이보크": "레인지로버 이보크",
  "discovery": "디스커버리", "디스커버리": "디스커버리", "ديسكفري": "디스커버리",
  "defender": "디펜더", "디펜더": "디펜더", "ديفندر": "디펜더",
  "freelander": "프리랜더",
  // HONDA
  "accord": "어코드", "어코드": "어코드", "اكورد": "어코드",
  "civic": "시빅", "시빅": "시빅", "سيفيك": "시빅",
  "cr-v": "CR-V", "crv": "CR-V", "CR-V": "CR-V", "سي ار في": "CR-V",
  "odyssey": "오딧세이", "오딧세이": "오딧세이",
  "pilot": "파일럿", "파일럿": "파일럿",
  "hrv": "HR-V", "hr-v": "HR-V",
  // NISSAN
  "qashqai": "캐시카이", "캐시카이": "캐시카이", "قشقاي": "캐시카이",
  "murano": "무라노", "무라노": "무라노", "مورانو": "무라노",
  "patrol": "패트롤", "패트롤": "패트롤", "باترول": "패트롤",
  "x-trail": "엑스트레일", "xtrail": "엑스트레일", "엑스트레일": "엑스트레일",
  "juke": "쥬크", "쥬크": "쥬크",
  "370z": "370Z", "gt-r": "GT-R", "gtr": "GT-R",
  // INFINITI
  "q50": "Q50", "q60": "Q60", "q70": "Q70",
  "qx50": "QX50", "qx60": "QX60", "qx70": "QX70", "qx80": "QX80",
  "Q50": "Q50", "QX80": "QX80",
  "انفينيتي q50": "Q50", "انفينيتي qx80": "QX80",
  // MINI
  "mini cooper": "미니쿠퍼", "cooper": "미니쿠퍼", "미니쿠퍼": "미니쿠퍼",
  "countryman": "컨트리맨", "컨트리맨": "컨트리맨",
  "clubman": "클럽맨", "paceman": "페이스맨",
  // FORD
  "mustang": "머스탱", "머스탱": "머스탱", "موستانج": "머스탱",
  "explorer": "익스플로러", "익스플로러": "익스플로러", "اكسبلورر": "익스플로러",
  "f-150": "F-150", "f150": "F-150",
  "bronco": "브롱코", "브롱코": "브롱코",
  "edge": "엣지", "엣지": "엣지",
  // JEEP
  "wrangler": "랭글러", "랭글러": "랭글러", "رانجلر": "랭글러",
  "grand cherokee": "그랜드체로키", "그랜드체로키": "그랜드체로키",
  "جراند شيروكي": "그랜드체로키",
  "compass": "컴패스", "컴패스": "컴패스",
  "renegade": "레니게이드",
  // LINCOLN
  "navigator": "네비게이터", "네비게이터": "네비게이터", "نافيجيتور": "네비게이터",
  "aviator": "에비에이터", "에비에이터": "에비에이터",
  "continental": "컨티넨탈",
  // CADILLAC
  "escalade": "에스컬레이드", "에스컬레이드": "에스컬레이드", "اسكاليد": "에스컬레이드",
  "ct5": "CT5", "ct6": "CT6", "xt5": "XT5", "xt6": "XT6",
  // MASERATI
  "ghibli": "기블리", "기블리": "기블리",
  "levante": "레반떼", "레반떼": "레반떼", "ليفانتي": "레반떼",
  "quattroporte": "콰트로포르테", "콰트로포르테": "콰트로포르테",
  "grecale": "그레칼레",
  // FERRARI
  "roma": "로마", "sf90": "SF90", "488": "488", "296": "296 GTB",
  // LAMBORGHINI
  "urus": "우루스", "우루스": "우루스",
  "huracan": "우라칸", "우라칸": "우라칸",
  "aventador": "아벤타도르",
};

const TRANSMISSION_TO_EN: Record<string, string> = {
  "오토": "auto",
  "수동": "manual",
  "CVT": "auto",
  "DCT": "auto",
};

const COLOR_MAP: Record<string, { ar: string; en: string }> = {
  "흰색":   { ar: "أبيض",    en: "white" },
  "검정색": { ar: "أسود",    en: "black" },
  "쥐색":   { ar: "رمادي",   en: "gray" },
  "은색":   { ar: "فضي",     en: "silver" },
  "빨간색": { ar: "أحمر",    en: "red" },
  "하늘색": { ar: "أزرق فاتح", en: "lightblue" },
  "갈색":   { ar: "بني",     en: "brown" },
  "녹색":   { ar: "أخضر",    en: "green" },
  "노란색": { ar: "أصفر",    en: "yellow" },
  "주황색": { ar: "برتقالي", en: "orange" },
  "연두색": { ar: "أخضر فاتح", en: "lime" },
};

const EN_COLOR_TO_KR: Record<string, string> = {
  "white":     "흰색",
  "black":     "검정색",
  "gray":      "쥐색",
  "grey":      "쥐색",
  "silver":    "은색",
  "red":       "빨간색",
  "lightblue": "하늘색",
  "blue":      "하늘색",
  "brown":     "갈색",
  "green":     "녹색",
  "yellow":    "노란색",
  "orange":    "주황색",
  "lime":      "연두색",
};

function formatPrice(price: number): string {
  const sar = Math.round(price * 27.4);
  return `${price.toLocaleString()}만원 (~${sar.toLocaleString()}﷼)`;
}

function buildEncarQuery(params: {
  brand?: string;
  model?: string;
  sunroof?: boolean;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
}): { q: string; modelKr: string | null; modelRaw: string | null } {
  let modelKr: string | null = null;
  let modelRaw: string | null = null;

  let carType = "";
  if (params.brand && params.brand !== "any") {
    const key = params.brand.toLowerCase();
    carType = DOMESTIC_BRANDS.has(key) ? "_.CarType.Y." : "_.CarType.N.";
  }

  let q = `(And.Hidden.N.${carType}`;

  if (params.brand && params.brand !== "any") {
    const kr = EN_TO_MANUFACTURER[params.brand.toLowerCase()];
    if (kr) q += `_.Manufacturer.${kr}.`;
  }

  if (params.model) {
    const input = params.model.trim();
    const isKorean = /[\uAC00-\uD7A3]/.test(input);

    if (isKorean) {
      const group = MODEL_GROUP_MAP[input];
      if (group) {
        q += `_.ModelGroup.${group}.`;
      } else {
        q += `_.Model.${input}.`;
      }
      modelKr = input;
    } else {
      const translated = EN_MODEL_TO_KR[input.toLowerCase()] ?? EN_MODEL_TO_KR[input];
      if (translated) {
        const group = MODEL_GROUP_MAP[translated];
        if (group) {
          q += `_.ModelGroup.${group}.`;
        } else {
          q += `_.Model.${translated}.`;
        }
        modelKr = translated;
      } else {
        modelRaw = input;
      }
    }
  }

  if (params.sunroof === true) q += "_.Options.선루프.";
  if (params.fuelType && params.fuelType !== "any") {
    const kr = EN_TO_FUEL_KR[params.fuelType];
    if (kr) q += `_.FuelType.${kr}.`;
  }
  if (params.transmission && params.transmission !== "any") {
    const kr = EN_TO_TRANSMISSION_KR[params.transmission];
    if (kr) q += `_.Transmission.${kr}.`;
  }
  if (params.bodyType && params.bodyType !== "any" && params.bodyType === "suv") {
    q += "_.Category.RV.";
  }
  if (params.color && params.color !== "any") {
    const kr = EN_COLOR_TO_KR[params.color.toLowerCase()];
    if (kr) q += `_.Color.${kr}.`;
  }

  q += ")";
  return { q, modelKr, modelRaw };
}

interface EncarCar {
  Id: string;
  Manufacturer: string;
  Model: string;
  Badge?: string;
  GreenType: string;
  FuelType: string;
  Transmission?: string;
  FormYear: string;
  Mileage: number;
  Price: number;
  Color?: string;
  Condition?: string[];
  Trust?: string[];
  ServiceMark?: string[];
  BuyType?: string[];
  HomeServiceVerification?: string;
  OfficeCityState?: string;
  Photos?: Array<{ location: string; ordering: number }>;
  Year?: number;
  Options?: string[];
}

const HARDWARE_OPTIONS: Array<{ keywords: string[]; id: string; ar: string }> = [
  { keywords: ["파노라마", "파노라믹", "파노라믹선루프"], id: "sunroof_pano", ar: "سقف بانورامي" },
  { keywords: ["선루프", "썬루프", "sunroof"], id: "sunroof", ar: "فتحة سقف" },
  { keywords: ["네비게이션", "내비게이션", "내비", "네비", "navi", "네비+"], id: "navigation", ar: "ملاحة" },
  { keywords: ["후방카메라", "후방 카메라", "후카", "후방cam", "리어카메라"], id: "camera_rear", ar: "كاميرا خلفية" },
  { keywords: ["360", "서라운드뷰", "어라운드뷰", "전방카메라"], id: "camera_360", ar: "كاميرا 360°" },
  { keywords: ["열선시트", "열선 시트", "열선"], id: "heated_seat", ar: "مقاعد مدفأة" },
  { keywords: ["통풍시트", "통풍 시트", "쿨링시트", "통풍"], id: "ventilated_seat", ar: "مقاعد مهوّاة" },
  { keywords: ["스마트키", "스마트 키", "스마트키리스"], id: "smart_key", ar: "مفتاح ذكي" },
  { keywords: ["가죽시트", "나파", "퀼팅시트", "천연가죽", "인조가죽"], id: "leather_seat", ar: "مقاعد جلدية" },
  { keywords: ["오토에어컨", "듀얼에어컨", "풀오토에어컨", "풀오토 에어", "tri-zone", "trizone"], id: "auto_ac", ar: "مكيّف تلقائي" },
  { keywords: ["파킹센서", "후방센서", "전방센서", "주차보조", "pdc", "주차센서", "upa"], id: "parking_sensor", ar: "حساسات وقوف" },
  { keywords: ["led헤드", "led 헤드", "풀led", "풀 led", "헤드램프 led", "레이저헤드", "매트릭스led"], id: "led_lights", ar: "مصابيح LED" },
  { keywords: ["어댑티브크루즈", "어댑티브 크루즈", "스마트크루즈", "acc", "scc"], id: "cruise_control", ar: "كروز تكيّفي" },
  { keywords: ["차선이탈", "차선 이탈", "레인킵", "lka", "lda"], id: "lane_assist", ar: "مساعد الحارة" },
  { keywords: ["사각지대", "bsd", "bcw", "후측방경보"], id: "blind_spot", ar: "كشف النقطة العمياء" },
  { keywords: ["헤드업", "hud", "헤드업 디스플레이"], id: "hud", ar: "HUD" },
  { keywords: ["전동시트", "파워시트", "전동 시트"], id: "power_seat", ar: "مقاعد كهربائية" },
  { keywords: ["메모리시트", "메모리 시트"], id: "memory_seat", ar: "مقاعد بذاكرة" },
  { keywords: ["4wd", "awd", "사륜", "4륜", "htrac", "xdrive", "quattro", "4motion"], id: "awd", ar: "دفع رباعي" },
  { keywords: ["하이브리드", "hybrid", "hev"], id: "hybrid", ar: "هجين" },
  { keywords: ["전기차", "전기", "electric", "ev6", "ev3", "ev9", "ioniq", "아이오닉"], id: "electric", ar: "كهربائي" },
  { keywords: ["플러그인", "phev", "plug-in", "플러그"], id: "phev", ar: "هجين قابل للشحن" },
];

const KOREAN_DOMESTIC_BRANDS = new Set([
  "현대", "기아", "제네시스", "쌍용", "르노삼성", "한국GM", "쉐보레", "쉐보레(GM대우)", "대우",
  "hyundai", "kia", "genesis", "ssangyong",
]);

function getModelYear(car: EncarCar): number {
  if (!car.Year) return 0;
  return Math.floor(car.Year / 100);
}

function getKoreanBaselineOptions(brand: string, year: number): Array<{ id: string; ar: string }> {
  const b = brand.toLowerCase();
  const isKorean = [...KOREAN_DOMESTIC_BRANDS].some((k) => b.includes(k));
  if (!isKorean || year < 2014) return [];

  const opts: Array<{ id: string; ar: string }> = [];
  if (year >= 2014) opts.push({ id: "navigation", ar: "ملاحة" });
  if (year >= 2016) opts.push({ id: "smart_key", ar: "مفتاح ذكي" });
  if (year >= 2017) opts.push({ id: "heated_seat", ar: "مقاعد مدفأة" });
  if (year >= 2018) opts.push({ id: "camera_rear", ar: "كاميرا خلفية" });
  if (year >= 2019) opts.push({ id: "auto_ac", ar: "مكيّف تلقائي" });
  if (year >= 2020) opts.push({ id: "parking_sensor", ar: "حساسات وقوف" });
  if (year >= 2021) opts.push({ id: "led_lights", ar: "مصابيح LED" });
  return opts;
}

const TOP_TRIM_KEYWORDS = [
  "칼리그라피", "인스퍼레이션", "익스클루시브", "풀옵션", "최고급", "플래티넘",
  "시그니처", "그래비티", "마스터즈", "prestige", "프레스티지",
];

const PREMIUM_KEYWORDS = [
  "럭셔리", "프리미엄", "어드밴스드", "모던", "리미티드",
  "파인스펙", "스마트", "트렌디", "디럭스플러스",
];

const BADGE_FEATURE_MAP: Array<{ keywords: string[]; ar: string }> = [
  { keywords: ["m 스포츠", "m스포츠", "m sport", "m-sport"], ar: "حزمة M الرياضية" },
  { keywords: ["럭셔리", "프리미엄", "익스클루시브", "풀옵션", "최고급", "플래티넘", "칼리그라피", "어드밴스드", "인스퍼레이션"], ar: "فئة مميزة" },
];

const CONDITION_FEATURE_MAP: Record<string, string> = {
  Record: "سجل الصيانة",
  Resume: "تاريخ السيارة",
};

const TRUST_FEATURE_MAP: Record<string, string> = {
  HomeService: "توصيل للمنزل",
};

const SERVICE_MARK_MAP: Record<string, string> = {
  EncarDiagnosisP1: "تشخيص Encar",
  EncarDiagnosisP2: "تشخيص Encar",
  EncarMeetgo: "Encar Meetgo",
};

const ENCAR_OPTION_MAP: Record<string, { id: string; ar: string }> = {
  "선루프": { id: "sunroof", ar: "فتحة سقف" },
  "파노라마선루프": { id: "sunroof_pano", ar: "سقف بانورامي" },
  "열선시트": { id: "heated_seat", ar: "مقاعد مدفأة" },
  "통풍시트": { id: "ventilated_seat", ar: "مقاعد مهوّاة" },
  "가죽시트": { id: "leather_seat", ar: "مقاعد جلدية" },
  "전동시트": { id: "power_seat", ar: "مقاعد كهربائية" },
  "메모리시트": { id: "memory_seat", ar: "مقاعد بذاكرة" },
  "네비게이션": { id: "navigation", ar: "ملاحة" },
  "후방카메라": { id: "camera_rear", ar: "كاميرا خلفية" },
  "어라운드뷰": { id: "camera_360", ar: "كاميرا 360°" },
  "스마트키": { id: "smart_key", ar: "مفتاح ذكي" },
  "오토에어컨": { id: "auto_ac", ar: "مكيّف تلقائي" },
  "주차보조": { id: "parking_sensor", ar: "حساسات وقوف" },
  "LED헤드램프": { id: "led_lights", ar: "مصابيح LED" },
  "어댑티브크루즈": { id: "cruise_control", ar: "كروز تكيّفي" },
  "차선이탈방지": { id: "lane_assist", ar: "مساعد الحارة" },
  "사각지대감지": { id: "blind_spot", ar: "كشف النقطة العمياء" },
  "헤드업디스플레이": { id: "hud", ar: "HUD" },
  "4WD": { id: "awd", ar: "دفع رباعي" },
};

function extractOptionsFromEncarOptions(options: string[]): Array<{ id: string; ar: string }> {
  const result: Array<{ id: string; ar: string }> = [];
  const seen = new Set<string>();
  for (const opt of options) {
    const mapped = ENCAR_OPTION_MAP[opt];
    if (mapped && !seen.has(mapped.id)) {
      seen.add(mapped.id);
      result.push(mapped);
    }
  }
  return result;
}

function extractOptions(car: EncarCar): Array<{ id: string; ar: string }> {
  if (car.Options && car.Options.length > 0) {
    const fromOptions = extractOptionsFromEncarOptions(car.Options);
    if (fromOptions.length > 0) return fromOptions;
  }

  const text = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  const result: Array<{ id: string; ar: string }> = [];
  const seen = new Set<string>();
  const add = (o: { id: string; ar: string }) => { if (!seen.has(o.id)) { seen.add(o.id); result.push(o); } };

  const isTopTrim = TOP_TRIM_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
  const isPremiumTrim = PREMIUM_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));

  const priorityOrder = ["phev", "electric", "hybrid"];
  const sorted = [...HARDWARE_OPTIONS].sort((a, b) => {
    const ai = priorityOrder.indexOf(a.id);
    const bi = priorityOrder.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  for (const opt of sorted) {
    if (opt.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      if (opt.id === "hybrid" && seen.has("phev")) continue;
      add(opt);
    }
  }

  const year = getModelYear(car);
  const brand = car.Manufacturer ?? "";
  for (const o of getKoreanBaselineOptions(brand, year)) add(o);

  if (isTopTrim) {
    for (const o of [
      { id: "leather_seat", ar: "مقاعد جلدية" },
      { id: "ventilated_seat", ar: "مقاعد مهوّاة" },
      { id: "power_seat", ar: "مقاعد كهربائية" },
      { id: "navigation", ar: "ملاحة" },
      { id: "smart_key", ar: "مفتاح ذكي" },
      { id: "auto_ac", ar: "مكيّف تلقائي" },
      { id: "camera_rear", ar: "كاميرا خلفية" },
      { id: "parking_sensor", ar: "حساسات وقوف" },
      { id: "led_lights", ar: "مصابيح LED" },
      { id: "heated_seat", ar: "مقاعد مدفأة" },
    ]) add(o);
  } else if (isPremiumTrim) {
    for (const o of [
      { id: "leather_seat", ar: "مقاعد جلدية" },
      { id: "navigation", ar: "ملاحة" },
      { id: "smart_key", ar: "مفتاح ذكي" },
      { id: "auto_ac", ar: "مكيّف تلقائي" },
      { id: "camera_rear", ar: "كاميرا خلفية" },
      { id: "heated_seat", ar: "مقاعد مدفأة" },
    ]) add(o);
  }

  return result;
}

function extractFeatures(car: EncarCar): string[] {
  const features: string[] = [];
  const seen = new Set<string>();
  const add = (label: string) => { if (!seen.has(label)) { seen.add(label); features.push(label); } };

  const text = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  for (const { keywords, ar } of BADGE_FEATURE_MAP) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) add(ar);
  }

  for (const c of car.Condition ?? []) {
    const label = CONDITION_FEATURE_MAP[c];
    if (label) add(label);
  }

  for (const t of car.Trust ?? []) {
    const label = TRUST_FEATURE_MAP[t];
    if (label) add(label);
  }

  for (const sm of car.ServiceMark ?? []) {
    const label = SERVICE_MARK_MAP[sm];
    if (label) { add(label); break; }
  }

  const fuel = FUEL_TO_EN[car.FuelType ?? ""] ?? "";
  const fuelAr: Record<string, string> = {
    gasoline: "بنزين", diesel: "ديزل", hybrid: "هايبرد",
    electric: "كهربائي", hydrogen: "هيدروجين", lpg: "غاز LPG",
  };
  if (fuelAr[fuel]) add(fuelAr[fuel]);

  const trans = TRANSMISSION_TO_EN[car.Transmission ?? ""] ?? "";
  if (trans === "auto") add("أوتوماتيك");
  else if (trans === "manual") add("يدوي");

  const condition2 = car.Condition ?? [];
  const inspected = condition2.includes("Inspection") || condition2.includes("InspectionDirect");
  if (inspected) add("فحص معتمد");

  const year = parseInt(car.FormYear ?? "0", 10);
  if (year >= 2023) add("موديل حديث");
  else if (year >= 2020) add("موديل جيد");

  if ((car.Mileage ?? 0) < 50000) add("ممشى منخفض");

  return features;
}

interface EncarResponse {
  Count: number;
  SearchResults: EncarCar[];
}

function mapEncarCar(car: EncarCar) {
  const sortedPhotos = (car.Photos ?? []).sort((a, b) => a.ordering - b.ordering);
  const firstPhoto = sortedPhotos[0];
  const imageUrl = firstPhoto ? `${ENCAR_PHOTO}${firstPhoto.location}` : "";

  const brandEn = MANUFACTURER_TO_EN[car.Manufacturer] ?? car.Manufacturer;
  const fuelEn = FUEL_TO_EN[car.FuelType] ?? "gasoline";
  const transmissionEn = TRANSMISSION_TO_EN[car.Transmission ?? ""] ?? "auto";
  const year = parseInt(car.FormYear, 10) || 0;
  const price = Math.round(car.Price);
  const model = car.Badge ? `${car.Model} ${car.Badge}` : car.Model;

  const colorKr = car.Color ?? "";
  const colorInfo = COLOR_MAP[colorKr];
  const colorEn = colorInfo?.en ?? colorKr;
  const colorAr = colorInfo?.ar;

  const condition = car.Condition ?? [];
  const inspected = condition.includes("Inspection") || condition.includes("InspectionDirect");

  const features = extractFeatures(car);
  const options = extractOptions(car);

  const badgeText = `${car.Model ?? ""} ${car.Badge ?? ""}`.toLowerCase();
  const hasSunroof = ["선루프", "썬루프", "파노라마", "파노라믹", "파노"].some((kw) => badgeText.includes(kw));

  return {
    id: car.Id,
    brand: brandEn,
    model,
    year,
    price,
    priceFormatted: formatPrice(price),
    mileage: Math.round(car.Mileage),
    fuelType: fuelEn,
    transmission: transmissionEn,
    bodyType: "sedan",
    color: colorEn,
    colorAr,
    sunroof: hasSunroof,
    inspected,
    imageUrl,
    thumbnailUrl: imageUrl,
    description: `${brandEn} ${car.Model} ${car.FormYear}`,
    features,
    options,
    source: "Encar",
    sourceUrl: `${ENCAR_DETAIL}${car.Id}`,
    location: car.OfficeCityState ?? "كوريا",
  };
}

router.get("/brands", (_req, res) => {
  res.json({
    brands: [
      "Hyundai", "Kia", "Genesis", "SsangYong", "KG Mobility",
      "Renault Samsung", "Renault Korea", "Chevrolet",
      "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Volvo",
      "Toyota", "Lexus", "Honda", "Nissan", "Infiniti",
      "Porsche", "Land Rover", "MINI", "Ford", "Jeep",
      "Lincoln", "Cadillac", "Maserati", "Ferrari", "Lamborghini",
    ],
  });
});

router.get("/search", async (req, res) => {
  const parsed = SearchCarsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_params", message: "Invalid query parameters" });
    return;
  }

  const {
    query, model, brand, yearFrom, yearTo, sunroof, transmission,
    fuelType, bodyType, color, priceMin, priceMax, mileageMax,
    page = 1, limit = 20,
  } = parsed.data;

  try {
    const { q: encarQ, modelRaw } = buildEncarQuery({ brand, model, sunroof, fuelType, transmission, bodyType, color });
    const offset = (page - 1) * limit;
    const fetchLimit = limit;
    const url = new URL(`${ENCAR_API}/search/car/list/general`);
    url.searchParams.set("count", "true");
    url.searchParams.set("q", encarQ);
    url.searchParams.set("sr", `|ModifiedDate|${offset}|${fetchLimit}`);

    const resp = await fetch(url.toString(), {
      headers: {
        Referer: "https://www.encar.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`Encar HTTP ${resp.status}`);

    const data = (await resp.json()) as EncarResponse;
    let cars = data.SearchResults.map(mapEncarCar);

    const seenIds = new Set<string>();
    const seenFp = new Set<string>();
    cars = cars.filter(c => {
      if (seenIds.has(c.id)) return false;
      seenIds.add(c.id);
      const fp = `${c.price}|${c.mileage}|${c.location}|${c.model}`;
      if (seenFp.has(fp)) return false;
      seenFp.add(fp);
      return true;
    });

    cars.forEach((c) => carCache.set(c.id, c));

    if (modelRaw) {
      const needle = modelRaw.toLowerCase();
      cars = cars.filter((c) => c.model.toLowerCase().includes(needle));
    }
    if (yearFrom !== undefined) cars = cars.filter((c) => c.year >= yearFrom);
    if (yearTo !== undefined) cars = cars.filter((c) => c.year <= yearTo);
    if (priceMin !== undefined) cars = cars.filter((c) => c.price >= priceMin);
    if (priceMax !== undefined) cars = cars.filter((c) => c.price <= priceMax);
    if (mileageMax !== undefined) cars = cars.filter((c) => c.mileage <= mileageMax);

    const total = data.Count;
    const totalPages = Math.ceil(total / limit);
    const paginated = cars.slice(0, limit);

    res.json({ cars: paginated, total, page, limit, totalPages });
  } catch (err) {
    req.log.error({ err }, "Encar API error");
    res.status(502).json({
      error: "upstream_error",
      message: "تعذر الاتصال بموقع Encar. يرجى المحاولة مرة أخرى.",
    });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  const { id } = req.params;

  try {
    const url = `https://api.encar.com/search/car/view/general/${id}`;
    const resp = await fetch(url, {
      headers: {
        Referer: "https://www.encar.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (resp.ok) {
      const data = await resp.json() as EncarCar;
      const car = mapEncarCar(data);
      carCache.set(car.id, car);
      res.json(car); return;
    }
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch car details from Encar, falling back to cache");
  }

  const cached = carCache.get(id);
  if (cached) { res.json(cached); return; }

  res.status(404).json({
    error: "not_found",
    message: "Car not found. Please search first and click a result.",
  });
});

export default router;
