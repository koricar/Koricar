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
  "대우": "Daewoo",
  "GM대우": "Daewoo",
  "한국GM": "Daewoo",
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
  "테슬라": "Tesla",
  "마쯔다": "Mazda",
  "스바루": "Subaru",
  "알파로메오": "Alfa Romeo",
  "미쯔비시": "Mitsubishi",
  "크라이슬러": "Chrysler",
  "푸조": "Peugeot",
  "시트로엥": "Citroen",
  "벤틀리": "Bentley",
  "롤스로이스": "Rolls-Royce",
  "맥라렌": "McLaren",
  "애스턴마틴": "Aston Martin",
  "GMC": "GMC",
  "닷지": "Dodge",
  "다이하쯔": "Daihatsu",
  "동풍소콘": "Dongfeng Sokon",
  "폴스타": "Polestar",
  "피아트": "Fiat",
  "험머": "Hummer",
  "사브": "Saab",
  "이네오스": "Ineos",
  "로터스": "Lotus",
  "BYD": "BYD",
  "비와이디": "BYD",
  "마이바흐": "Maybach",
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
  "daewoo": "쉐보레(GM대우)",
  "gm daewoo": "쉐보레(GM대우)",
  "damas": "쉐보레(GM대우)",
  "labo": "쉐보레(GM대우)",
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
  "tesla": "테슬라",
  "mazda": "마쯔다",
  "subaru": "스바루",
  "alfa romeo": "알파로메오",
  "mitsubishi": "미쯔비시",
  "chrysler": "크라이슬러",
  "peugeot": "푸조",
  "citroen": "시트로엥",
  "bentley": "벤틀리",
  "aston martin": "애스턴마틴",
  "gmc": "GMC",
  "dodge": "닷지",
  "daihatsu": "다이하쯔",
  "polestar": "폴스타",
  "fiat": "피아트",
  "hummer": "험머",
  "saab": "사브",
  "ineos": "이네오스",
  "lotus": "로터스",
  "byd": "BYD",
  "maybach": "마이바흐",
};

const DOMESTIC_BRANDS = new Set([
  "hyundai", "kia", "genesis", "ssangyong", "kg mobility",
  "renault samsung", "renault korea", "chevrolet",
  "daewoo", "gm daewoo",
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
  "lpg": "LPG(일반인 구입_)",
  "electric": "전기",
  "hybrid": "가솔린+전기",
};

const EN_TO_TRANSMISSION_KR: Record<string, string> = {
  "auto": "오토",
  "manual": "수동",
};

const MODEL_GROUP_MAP: Record<string, string> = {
  // ── HYUNDAI ──────────────────────────────
  "아반떼": "아반떼", "아반떼 (CN7)": "아반떼", "아반떼 하이브리드 (CN7)": "아반떼", "아반떼 MD": "아반떼",
  "쏘나타": "쏘나타", "쏘나타 (DN8)": "쏘나타", "쏘나타 하이브리드 (DN8)": "쏘나타", "LF 쏘나타": "쏘나타",
  "그랜저": "그랜저", "그랜저 (GN7)": "그랜저", "그랜저 하이브리드 (GN7)": "그랜저",
  "더 뉴 그랜저 IG": "그랜저", "그랜저 HG": "그랜저",
  "투싼": "투싼", "투싼 (NX4)": "투싼", "더 뉴 투싼 TL": "투싼",
  "싼타페": "싼타페", "싼타페 (MX5)": "싼타페", "더 뉴 싼타페": "싼타페", "싼타페 TM": "싼타페",
  "팰리세이드": "팰리세이드", "더 뉴 팰리세이드": "팰리세이드",
  "코나": "코나", "코나 (OS)": "코나", "코나 (SX2)": "코나",
  "아이오닉 5": "아이오닉5", "아이오닉 5 N": "아이오닉5",
  "아이오닉5": "아이오닉5", "아이오닉5 N": "아이오닉5",
  "더 뉴 아이오닉5": "아이오닉5",
  "아이오닉 6": "아이오닉6", "아이오닉6": "아이오닉6",
  "아이오닉 9": "아이오닉9", "아이오닉9": "아이오닉9",
  "아이오닉": "아이오닉",
  "더 뉴 아이오닉 하이브리드": "아이오닉",
  "아이오닉 하이브리드": "아이오닉",
  "아이오닉 플러그인 하이브리드": "아이오닉",
  "아이오닉 일렉트릭": "아이오닉",
  "스타리아": "스타리아", "스타리아 라운지": "스타리아",
  "스타렉스": "스타렉스", "더 뉴 그랜드 스타렉스": "스타렉스",
  "넥쏘": "넥쏘", "베뉴": "베뉴",
  "캐스퍼": "캐스퍼", "캐스퍼 일렉트릭": "캐스퍼",
  "엑센트": "엑센트", "벨로스터": "벨로스터",
  "포터": "포터", "포터 2": "포터",
  // ── KIA ──────────────────────────────────
  "K3": "K3", "더 뉴 K3 2세대": "K3",
  "K5": "K5", "K5 3세대": "K5", "K5 하이브리드 3세대": "K5", "더 뉴 K5 2세대": "K5",
  "K8": "K8", "K8 하이브리드": "K8", "K9": "K9",
  "스팅어": "스팅어",
  "스포티지": "스포티지", "스포티지 5세대": "스포티지",
  "스포티지 5세대 하이브리드": "스포티지", "스포티지 5세대 플러그인 하이브리드": "스포티지",
  "쏘렌토": "쏘렌토", "쏘렌토 4세대": "쏘렌토", "쏘렌토 하이브리드 4세대": "쏘렌토",
  "쏘렌토 플러그인 하이브리드 4세대": "쏘렌토", "더 뉴 쏘렌토 4세대": "쏘렌토",
  "텔루라이드": "텔루라이드",
  "모하비": "모하비", "더 뉴 모하비": "모하비", "모하비 더 마스터": "모하비",
  "셀토스": "셀토스", "더 뉴 셀토스": "셀토스",
  "니로": "니로", "디 올 뉴 니로": "니로", "니로 하이브리드": "니로", "니로 EV": "니로",
  "쏘울": "쏘울",
  "카니발": "카니발", "카니발 4세대": "카니발", "올 뉴 카니발": "카니발",
  "더 뉴 카니발": "카니발", "카니발 리무진": "카니발",
  "모닝": "모닝", "레이": "레이",
  "EV3": "EV3", "EV6": "EV6", "EV6 GT": "EV6", "EV9": "EV9",
  // ── GENESIS ──────────────────────────────
  "G70": "G70", "더 뉴 G70": "G70", "G70 2세대": "G70",
  "G80": "G80", "G80 (RG3)": "G80", "G80 전동화": "G80",
  "G90": "G90", "G90 (RS4)": "G90", "EQ900": "G90",
  "GV60": "GV60", "GV60 스포츠 플러스": "GV60",
  "GV70": "GV70", "GV70 전동화": "GV70",
  "GV80": "GV80", "GV80 쿠페": "GV80",
  "GV90": "GV90",
  // ── CHEVROLET ─────────────────────────────
  "트레일블레이저": "트레일블레이저", "더 뉴 트레일블레이저": "트레일블레이저",
  "트랙스": "트랙스", "트랙스 크로스오버": "트랙스",
  "말리부": "말리부", "스파크": "스파크",
  "이쿼녹스": "이쿼녹스", "이쿼녹스 EV": "이쿼녹스",
  "콜로라도": "콜로라도", "트래버스": "트래버스",
  "타호": "타호", "올란도": "올란도", "캡티바": "캡티바",
  "블레이저 EV": "블레이저 EV",
  "다마스": "다마스", "뉴 다마스": "다마스",
  "라보": "라보", "뉴 라보": "라보",
  "마티즈": "마티즈", "마티즈 크리에이티브": "마티즈",
  "젠트라": "젠트라", "젠트라 X": "젠트라",
  "라세티": "라세티", "라세티 프리미어": "라세티",
  "크루즈": "크루즈", "레조": "레조",
  "윈스톰": "윈스톰", "윈스톰 맥스": "윈스톰",
  "알페온": "알페온", "매그너스": "매그너스", "베리타스": "베리타스",
  // ── GMC ───────────────────────────────────
  "시에라": "시에라", "GMC 시에라": "시에라",
  "아카디아": "아카디아", "GMC 아카디아": "아카디아",
  "유콘": "유콘", "캐니언": "캐니언",
  // ── DODGE ─────────────────────────────────
  "챌린저": "챌린저", "차저": "차저", "듀랑고": "듀랑고", "램": "램",
  // ── POLESTAR ──────────────────────────────
  "폴스타 2": "폴스타 2", "폴스타 3": "폴스타 3", "폴스타 4": "폴스타 4",
  // ── FIAT ──────────────────────────────────
  "500": "500", "500X": "500X",
  // ── HUMMER ────────────────────────────────
  "허머 H2": "허머 H2", "허머 H3": "허머 H3", "GMC 허머 EV": "GMC 허머 EV",
  // ── SAAB ──────────────────────────────────
  "사브 9-3": "사브 9-3", "사브 9-5": "사브 9-5",
  // ── LOTUS ─────────────────────────────────
  "엘리스": "엘리스", "에보라": "에보라", "에미라": "에미라", "일레트르": "일레트르",
  // ── BYD ───────────────────────────────────
  "아토 3": "아토 3", "씰": "씰", "돌핀": "돌핀", "탕": "탕",
  // ── MAYBACH ───────────────────────────────
  "마이바흐 S클래스": "마이바흐 S클래스", "마이바흐 GLS": "마이바흐 GLS",
  // ── RENAULT ───────────────────────────────
  "QM6": "QM6", "QM6 LPe": "QM6", "SM6": "SM6", "XM3": "XM3",
  "아르카나": "XM3", "SM3": "SM3", "SM5": "SM5", "SM7": "SM7",
  "QM3": "QM3", "QM5": "QM5", "필랑트": "필랑트",
  // ── SSANGYONG / KGM ───────────────────────
  "렉스턴": "렉스턴", "렉스턴 G4": "렉스턴",
  "렉스턴 스포츠": "렉스턴", "렉스턴 스포츠 칸": "렉스턴",
  "코란도": "코란도", "코란도 이모션": "코란도",
  "티볼리": "티볼리", "티볼리 에어": "티볼리",
  "무쏘": "무쏘", "토레스": "토레스", "토레스 EVX": "토레스",
  "액티언": "액티언", "액티언 스포츠": "액티언",
  // ── BMW ───────────────────────────────────
  "1시리즈": "1시리즈", "1시리즈 (E87)": "1시리즈", "1시리즈 (F20)": "1시리즈", "1시리즈 (F40)": "1시리즈",
  "2시리즈": "2시리즈", "2시리즈 쿠페 (F22)": "2시리즈", "2시리즈 그란쿠페 (F44)": "2시리즈",
  "2시리즈 액티브투어러 (F45)": "2시리즈", "2시리즈 (G42)": "2시리즈",
  "3시리즈": "3시리즈", "3시리즈 (E90)": "3시리즈", "3시리즈 (F30)": "3시리즈", "3시리즈 (G20)": "3시리즈",
  "4시리즈": "4시리즈", "4시리즈 (F32)": "4시리즈", "4시리즈 (F36)": "4시리즈", "4시리즈 (G22)": "4시리즈",
  "4시리즈 그란쿠페 (F36)": "4시리즈", "4시리즈 그란쿠페 (G26)": "4시리즈",
  "5시리즈": "5시리즈", "5시리즈 (F10)": "5시리즈", "5시리즈 (G30)": "5시리즈", "5시리즈 (G60)": "5시리즈",
  "6시리즈": "6시리즈", "6시리즈 (F12)": "6시리즈", "6시리즈 (F06)": "6시리즈", "6시리즈 그란투리스모 (G32)": "6시리즈",
  "7시리즈": "7시리즈", "7시리즈 (F01)": "7시리즈", "7시리즈 (G11)": "7시리즈", "7시리즈 (G70)": "7시리즈",
  "8시리즈": "8시리즈", "8시리즈 (G15)": "8시리즈", "8시리즈 그란쿠페 (G16)": "8시리즈",
  "X1": "X1", "X1 (E84)": "X1", "X1 (F48)": "X1", "X1 (U11)": "X1",
  "X2": "X2", "X2 (F39)": "X2", "X2 (U10)": "X2",
  "X3": "X3", "X3 (F25)": "X3", "X3 (G01)": "X3", "X3 (G45)": "X3",
  "X4": "X4", "X4 (F26)": "X4", "X4 (G02)": "X4",
  "X5": "X5", "X5 (F15)": "X5", "X5 (G05)": "X5",
  "X6": "X6", "X6 (F16)": "X6", "X6 (G06)": "X6",
  "X7": "X7", "X7 (G07)": "X7",
  "M2": "M2", "M2 (F87)": "M2", "M2 (G87)": "M2",
  "M3": "M3", "M3 (F80)": "M3", "M3 (G80)": "M3",
  "M4": "M4", "M4 (F82)": "M4", "M4 (G82)": "M4",
  "M5": "M5", "M5 (F90)": "M5", "M5 (G90)": "M5",
  "M8": "M8", "M8 (F92)": "M8",
  "i3": "i3", "i4": "i4", "i4 (G26)": "i4",
  "i5": "i5", "i5 (G60)": "i5",
  "i7": "i7", "i7 (G70)": "i7",
  "i8": "i8",
  "iX": "iX", "iX3": "iX3", "iX3 (G08)": "iX3",
  "XM": "XM", "Z4": "Z4", "Z4 (G29)": "Z4",
  // ── MERCEDES-BENZ ─────────────────────────
  "A클래스": "A클래스", "A클래스 (W176)": "A클래스", "A클래스 (W177)": "A클래스",
  "B클래스": "B클래스",
  "C클래스": "C클래스", "C클래스 (W204)": "C클래스", "C클래스 (W205)": "C클래스", "C클래스 (W206)": "C클래스",
  "E클래스": "E클래스", "E클래스 (W212)": "E클래스", "E클래스 (W213)": "E클래스", "E클래스 (W214)": "E클래스",
  "S클래스": "S클래스", "S클래스 (W221)": "S클래스", "S클래스 (W222)": "S클래스", "S클래스 (W223)": "S클래스",
  "G클래스": "G클래스", "G클래스 (W463)": "G클래스",
  "CLA클래스": "CLA클래스", "CLA (C117)": "CLA클래스", "CLA (C118)": "CLA클래스",
  "CLS클래스": "CLS클래스", "CLS (C257)": "CLS클래스",
  "CLE클래스": "CLE클래스",
  "GLA클래스": "GLA클래스", "GLA (X156)": "GLA클래스", "GLA (H247)": "GLA클래스",
  "GLB클래스": "GLB클래스",
  "GLC클래스": "GLC클래스", "GLC (X253)": "GLC클래스", "GLC (X254)": "GLC클래스",
  "GLC쿠페": "GLC쿠페", "GLC쿠페 (C253)": "GLC쿠페",
  "GLE클래스": "GLE클래스", "GLE (W166)": "GLE클래스", "GLE (V167)": "GLE클래스",
  "GLE쿠페": "GLE쿠페",
  "GLS클래스": "GLS클래스", "GLS (X166)": "GLS클래스", "GLS (X167)": "GLS클래스",
  "EQA": "EQA", "EQB": "EQB", "EQC": "EQC",
  "EQE": "EQE", "EQE SUV": "EQE",
  "EQS": "EQS", "EQS SUV": "EQS",
  "AMG GT": "AMG GT", "AMG GT (R190)": "AMG GT",
  "SL클래스": "SL클래스",
  // ── AUDI ──────────────────────────────────
  "A1": "A1", "A3": "A3", "A4": "A4", "A5": "A5", "A6": "A6", "A7": "A7", "A8": "A8",
  "Q2": "Q2", "Q3": "Q3", "Q4 e-tron": "Q4 e-tron",
  "Q5": "Q5", "Q7": "Q7", "Q8": "Q8", "Q8 e-tron": "Q8 e-tron",
  "e-tron": "e-tron", "e-tron GT": "e-tron GT",
  "TT": "TT", "R8": "R8",
  "RS3": "RS3", "RS4": "RS4", "RS5": "RS5", "RS6": "RS6", "RS7": "RS7",
  "SQ5": "SQ5", "SQ7": "SQ7", "SQ8": "SQ8",
  "S3": "S3", "S4": "S4", "S5": "S5", "S6": "S6", "S7": "S7", "S8": "S8",
  // ── VOLKSWAGEN ───────────────────────────
  "골프": "골프", "골프 GTI": "골프", "골프 R": "골프",
  "티구안": "티구안", "티구안 올스페이스": "티구안",
  "파사트": "파사트", "파사트 CC": "파사트",
  "투아렉": "투아렉", "폴로": "폴로", "아테온": "아테온",
  "ID.4": "ID.4", "ID.6": "ID.6",
  // ── VOLVO ────────────────────────────────
  "XC40": "XC40", "XC40 리차지": "XC40",
  "XC60": "XC60", "XC90": "XC90", "XC90 리차지": "XC90",
  "S60": "S60", "S90": "S90",
  "V60": "V60", "V60 크로스컨트리": "V60",
  "V90": "V90", "V90 크로스컨트리": "V90",
  "EX30": "EX30", "EX40": "EX40", "EX90": "EX90",
  "C40 리차지": "C40",
  // ── TOYOTA ───────────────────────────────
  "캠리": "캠리", "RAV4": "RAV4", "RAV4 하이브리드": "RAV4",
  "프리우스": "프리우스", "시에나": "시에나", "아발론": "아발론",
  "알파드": "알파드", "벨파이어": "벨파이어",
  "크라운 크로스오버": "크라운 크로스오버",
  "랜드크루저": "랜드크루저", "랜드크루저 프라도": "랜드크루저",
  "하이랜더": "하이랜더", "GR86": "GR86", "GR 수프라": "GR 수프라",
  // ── LEXUS ────────────────────────────────
  "IS250": "IS250", "IS300h": "IS300h",
  "ES300h 7세대": "ES300h", "뉴 ES350": "ES300h",
  "RX350": "RX350", "RX450h 4세대": "RX350",
  "NX300h": "NX300h", "NX350h 2세대": "NX350h", "NX450h+ 2세대": "NX450h+",
  "LS500h 5세대": "LS500h", "LS460": "LS460",
  "UX250h": "UX250h", "CT200h": "CT200h",
  "LX600": "LX600", "LX570": "LX570",
  "LC500": "LC500", "LC500h": "LC500h",
  // ── PORSCHE ──────────────────────────────
  "카이엔": "카이엔", "카이엔 쿠페": "카이엔",
  "마칸": "마칸", "마칸 EV": "마칸",
  "파나메라": "파나메라",
  "타이칸": "타이칸", "타이칸 크로스 투리스모": "타이칸",
  "911": "911", "박스터": "박스터", "케이맨": "케이맨",
  // ── LAND ROVER ───────────────────────────
  "레인지로버": "레인지로버", "레인지로버 스포츠": "레인지로버 스포츠",
  "레인지로버 이보크": "레인지로버 이보크", "레인지로버 벨라": "레인지로버 벨라",
  "디스커버리": "디스커버리", "디스커버리 스포츠": "디스커버리", "디펜더": "디펜더",
  // ── HONDA ────────────────────────────────
  "어코드": "어코드", "시빅": "시빅",
  "CR-V": "CR-V", "파일럿": "파일럿", "오딧세이": "오딧세이", "HR-V": "HR-V",
  // ── NISSAN ───────────────────────────────
  "캐시카이": "캐시카이", "무라노": "무라노",
  "패트롤": "패트롤", "엑스트레일": "엑스트레일",
  "쥬크": "쥬크", "370Z": "370Z", "GT-R": "GT-R",
  // ── INFINITI ─────────────────────────────
  "Q50": "Q50", "Q60": "Q60", "Q70": "Q70",
  "QX50": "QX50", "QX60": "QX60", "QX70": "QX70", "QX80": "QX80",
  // ── MINI ─────────────────────────────────
  "미니쿠퍼": "미니쿠퍼", "컨트리맨": "컨트리맨",
  "클럽맨": "클럽맨", "페이스맨": "페이스맨", "에이스맨": "에이스맨",
  // ── FORD ─────────────────────────────────
  "머스탱": "머스탱", "익스플로러": "익스플로러",
  "F-150": "F-150", "브롱코": "브롱코", "엣지": "엣지", "머스탱 마하-E": "머스탱 마하-E",
  // ── JEEP ─────────────────────────────────
  "랭글러": "랭글러", "그랜드체로키": "그랜드체로키",
  "컴패스": "컴패스", "레니게이드": "레니게이드",
  // ── LINCOLN ──────────────────────────────
  "네비게이터": "네비게이터", "네비게이터 4세대": "네비게이터", "네비게이터 L": "네비게이터",
  "에비에이터": "에비에이터", "에비에이터 2세대": "에비에이터",
  "노틸러스": "노틸러스", "노틸러스 2세대": "노틸러스",
  "코르세어": "코르세어", "컨티넨탈": "컨티넨탈", "컨티넨탈 10세대": "컨티넨탈",
  "MKZ": "MKZ", "MKX": "MKX", "MKC": "MKC",
  // ── CADILLAC ─────────────────────────────
  "에스컬레이드": "에스컬레이드", "CT5": "CT5", "CT6": "CT6",
  "XT4": "XT4", "XT5": "XT5", "XT6": "XT6", "리릭": "리릭",
  // ── TESLA ────────────────────────────────
  "모델 S": "모델 S", "모델 3": "모델 3", "모델 X": "모델 X", "모델 Y": "모델 Y",
  "사이버트럭": "사이버트럭",
  // ── MASERATI ─────────────────────────────
  "기블리": "기블리", "레반떼": "레반떼",
  "콰트로포르테": "콰트로포르테", "그레칼레": "그레칼레", "MC20": "MC20",
  // ── FERRARI ──────────────────────────────
  "로마": "로마", "SF90": "SF90", "488": "488", "296 GTB": "296 GTB", "포르토피노": "포르토피노",
  // ── LAMBORGHINI ──────────────────────────
  "우루스": "우루스", "우라칸": "우라칸", "아벤타도르": "아벤타도르",
  // ── MAZDA ────────────────────────────────
  "CX-5": "CX-5", "CX-8": "CX-8", "CX-60": "CX-60", "MX-5": "MX-5", "마쯔다 3": "마쯔다 3",
  // ── SUBARU ───────────────────────────────
  "아웃백": "아웃백", "포레스터": "포레스터", "임프레자": "임프레자", "레거시": "레거시", "크로스트렉": "크로스트렉",
  // ── ALFA ROMEO ───────────────────────────
  "줄리아": "줄리아", "스텔비오": "스텔비오", "토날레": "토날레",
  // ── MITSUBISHI ───────────────────────────
  "아웃랜더": "아웃랜더", "이클립스 크로스": "이클립스 크로스", "파제로": "파제로",
  // ── BENTLEY ──────────────────────────────
  "컨티넨탈 GT": "컨티넨탈 GT", "벤테이가": "벤테이가", "플라잉 스퍼": "플라잉 스퍼",
  // ── ROLLS-ROYCE ───────────────────────────
  "팬텀": "팬텀", "고스트": "고스트", "컬리넌": "컬리넌", "레이스": "레이스",
};

const EN_MODEL_TO_KR: Record<string, string> = {
  "avante": "아반떼", "elantra": "아반떼", "아반떼": "아반떼", "ألانترا": "아반떼", "ايلانترا": "아반떼",
  "sonata": "쏘나타", "쏘나타": "쏘나타", "سوناتا": "쏘나타",
  "grandeur": "그랜저", "그랜저": "그랜저", "جرانديور": "그랜저",
  "accent": "엑센트", "verna": "엑센트", "엑센트": "엑센트", "اكسنت": "엑센트",
  "tucson": "투싼", "투싼": "투싼", "توسان": "투싼", "تيوسون": "투싼",
  "santa fe": "싼타페", "santafe": "싼타페", "싼타페": "싼타페", "سانتافي": "싼타페",
  "palisade": "팰리세이드", "팰리세이드": "팰리세이드", "باليسيد": "팰리세이드",
  "kona": "코나", "코나": "코나", "كونا": "코나",
  "nexo": "넥쏘", "넥쏘": "넥쏘",
  "venue": "베뉴", "베뉴": "베뉴",
  "staria": "스타리아", "스타리아": "스타리아", "ستاريا": "스타리아",
  "starex": "스타렉스", "스타렉스": "스타렉스", "ستاريكس": "스타렉스",
  "ioniq": "아이오닉", "아이오닉": "아이오닉", "ايونيك": "아이오닉",
  "ioniq 5": "아이오닉5", "ioniq5": "아이오닉5", "아이오닉 5": "아이오닉5", "ايونيك 5": "아이오닉5",
  "ioniq 6": "아이오닉6", "ioniq6": "아이오닉6", "아이오닉 6": "아이오닉6", "ايونيك 6": "아이오닉6",
  "ioniq 9": "아이오닉9", "ioniq9": "아이오닉9", "아이오닉 9": "아이오닉9",
  "porter": "포터", "포터": "포터",
  "casper": "캐스퍼", "캐스퍼": "캐스퍼", "كاسبر": "캐스퍼",
  "veloster": "벨로스터", "벨로스터": "벨로스터",
  "k3": "K3", "k5": "K5", "k8": "K8", "k9": "K9",
  "K3": "K3", "K5": "K5", "K8": "K8", "K9": "K9",
  "كي3": "K3", "كي5": "K5", "كي8": "K8", "كي9": "K9",
  "stinger": "스팅어", "스팅어": "스팅어", "ستينجر": "스팅어",
  "sportage": "스포티지", "스포티지": "스포티지", "سبورتاج": "스포티지",
  "sorento": "쏘렌토", "쏘렌토": "쏘렌토", "سورينتو": "쏘렌토",
  "telluride": "텔루라이드", "텔루라이드": "텔루라이드", "تيلورايد": "텔루라이드",
  "mohave": "모하비", "모하비": "모하비", "موهابي": "모하비",
  "seltos": "셀토스", "셀토스": "셀토스", "سيلتوس": "셀토스",
  "niro": "니로", "니로": "니로", "نيرو": "니로",
  "soul": "쏘울", "쏘울": "쏘울", "سول": "쏘울",
  "carnival": "카니발", "sedona": "카니발", "카니발": "카니발", "كارنيفال": "카니발",
  "morning": "모닝", "모닝": "모닝",
  "ray": "레이", "레이": "레이",
  "ev3": "EV3", "EV3": "EV3",
  "ev6": "EV6", "EV6": "EV6",
  "ev9": "EV9", "EV9": "EV9",
  "g70": "G70", "g80": "G80", "g90": "G90",
  "gv60": "GV60", "gv70": "GV70", "gv80": "GV80", "gv90": "GV90",
  "G70": "G70", "G80": "G80", "G90": "G90",
  "GV60": "GV60", "GV70": "GV70", "GV80": "GV80", "GV90": "GV90",
  "جي70": "G70", "جي80": "G80", "جي90": "G90",
  "eq900": "G90", "EQ900": "G90",
  "rexton": "렉스턴", "렉스턴": "렉스턴", "ركستون": "렉스턴",
  "korando": "코란도", "코란도": "코란도", "كورندو": "코란도",
  "tivoli": "티볼리", "티볼리": "티볼리", "تيفولي": "티볼리",
  "musso": "무쏘", "무쏘": "무쏘", "موسو": "무쏘",
  "actyon": "액티언", "액티언": "액티언",
  "torres": "토레스", "토레스": "토레스", "تورس": "토레스",
  "sm3": "SM3", "sm5": "SM5", "sm6": "SM6", "sm7": "SM7",
  "SM3": "SM3", "SM5": "SM5", "SM6": "SM6", "SM7": "SM7",
  "qm3": "QM3", "qm5": "QM5", "qm6": "QM6",
  "QM3": "QM3", "QM5": "QM5", "QM6": "QM6",
  "xm3": "XM3", "XM3": "XM3", "arkana": "XM3",
  "malibu": "말리부", "말리부": "말리부", "ماليبو": "말리부",
  "trax": "트랙스", "트랙스": "트랙스", "تراكس": "트랙스",
  "trailblazer": "트레일블레이저", "트레일블레이저": "트레일블레이저",
  "spark": "스파크", "스파크": "스파크", "سبارك": "스파크",
  "equinox": "이쿼녹스", "이쿼녹스": "이쿼녹스",
  "colorado": "콜로라도", "콜로라도": "콜로라도",
  "traverse": "트래버스", "트래버스": "트래버스",
  "tahoe": "타호", "타호": "타호", "تاهو": "타호",
  "damas": "다마스", "다마스": "다마스", "داماس": "다마스",
  "labo": "라보", "라보": "라보", "لابو": "라보",
  "matiz": "마티즈", "마티즈": "마티즈", "ماتيز": "마티즈",
  "cruze": "크루즈", "크루즈": "크루즈", "كروز": "크루즈",
  "1 series": "1시리즈", "1series": "1시리즈", "1시리즈": "1시리즈",
  "2 series": "2시리즈", "2series": "2시리즈", "2시리즈": "2시리즈",
  "3 series": "3시리즈", "3series": "3시리즈", "3시리즈": "3시리즈",
  "320i": "3시리즈", "330i": "3시리즈", "320d": "3시리즈", "330d": "3시리즈",
  "4 series": "4시리즈", "4series": "4시리즈", "4시리즈": "4시리즈",
  "5 series": "5시리즈", "5series": "5시리즈", "5시리즈": "5시리즈",
  "520i": "5시리즈", "530i": "5시리즈", "530d": "5시리즈", "540i": "5시리즈",
  "6 series": "6시리즈", "6시리즈": "6시리즈",
  "7 series": "7시리즈", "7series": "7시리즈", "7시리즈": "7시리즈",
  "730i": "7시리즈", "740i": "7시리즈", "750i": "7시리즈",
  "8 series": "8시리즈", "8시리즈": "8시리즈",
  "x1": "X1", "X1": "X1", "x2": "X2", "X2": "X2",
  "x3": "X3", "X3": "X3", "x4": "X4", "X4": "X4",
  "x5": "X5", "X5": "X5", "x6": "X6", "X6": "X6",
  "x7": "X7", "X7": "X7",
  "m2": "M2", "M2": "M2", "m3": "M3", "M3": "M3",
  "m4": "M4", "M4": "M4", "m5": "M5", "M5": "M5", "m8": "M8", "M8": "M8",
  "i3": "i3", "i4": "i4", "i5": "i5", "i7": "i7", "i8": "i8",
  "ix": "iX", "iX": "iX", "ix3": "iX3", "iX3": "iX3",
  "xm": "XM", "XM": "XM", "z4": "Z4", "Z4": "Z4",
  "a class": "A클래스", "a-class": "A클래스", "A클래스": "A클래스",
  "c class": "C클래스", "c-class": "C클래스", "C클래스": "C클래스",
  "c200": "C클래스", "c300": "C클래스", "c220": "C클래스",
  "e class": "E클래스", "e-class": "E클래스", "E클래스": "E클래스",
  "e200": "E클래스", "e220": "E클래스", "e300": "E클래스", "e350": "E클래스",
  "s class": "S클래스", "s-class": "S클래스", "S클래스": "S클래스",
  "s400": "S클래스", "s500": "S클래스", "s580": "S클래스",
  "g class": "G클래스", "g-class": "G클래스", "g wagon": "G클래스", "G클래스": "G클래스",
  "g500": "G클래스", "g550": "G클래스", "g63": "G클래스",
  "cla": "CLA클래스", "CLA": "CLA클래스", "CLA클래스": "CLA클래스",
  "cls": "CLS클래스", "CLS": "CLS클래스",
  "gla": "GLA클래스", "GLA": "GLA클래스",
  "glb": "GLB클래스", "GLB": "GLB클래스",
  "glc": "GLC클래스", "GLC": "GLC클래스",
  "gle": "GLE클래스", "GLE": "GLE클래스",
  "gls": "GLS클래스", "GLS": "GLS클래스",
  "eqa": "EQA", "EQA": "EQA", "eqb": "EQB", "EQB": "EQB",
  "eqc": "EQC", "EQC": "EQC", "eqe": "EQE", "EQE": "EQE",
  "eqs": "EQS", "EQS": "EQS",
  "amg gt": "AMG GT", "AMG GT": "AMG GT",
  "sl": "SL클래스", "SL클래스": "SL클래스",
  "a1": "A1", "A1": "A1",
  "a3": "A3", "a4": "A4", "a5": "A5", "a6": "A6", "a7": "A7", "a8": "A8",
  "A3": "A3", "A4": "A4", "A5": "A5", "A6": "A6", "A7": "A7", "A8": "A8",
  "q2": "Q2", "q3": "Q3", "q5": "Q5", "q7": "Q7", "q8": "Q8",
  "Q2": "Q2", "Q3": "Q3", "Q5": "Q5", "Q7": "Q7", "Q8": "Q8",
  "e-tron": "e-tron", "etron": "e-tron",
  "tt": "TT", "TT": "TT", "r8": "R8", "R8": "R8",
  "rs3": "RS3", "rs4": "RS4", "rs5": "RS5", "rs6": "RS6", "rs7": "RS7",
  "RS3": "RS3", "RS4": "RS4", "RS5": "RS5", "RS6": "RS6", "RS7": "RS7",
  "golf": "골프", "골프": "골프", "جولف": "골프",
  "tiguan": "티구안", "티구안": "티구안", "تيجوان": "티구안",
  "passat": "파사트", "파사트": "파사트",
  "touareg": "투아렉", "투아렉": "투아렉", "توارك": "투아렉",
  "polo": "폴로", "arteon": "아테온",
  "id.4": "ID.4", "id4": "ID.4", "id.6": "ID.6",
  "xc40": "XC40", "xc60": "XC60", "xc90": "XC90",
  "XC40": "XC40", "XC60": "XC60", "XC90": "XC90",
  "s60": "S60", "S60": "S60", "s90": "S90", "S90": "S90",
  "ex30": "EX30", "ex40": "EX40", "ex90": "EX90",
  "camry": "캠리", "캠리": "캠리", "كامري": "캠리",
  "rav4": "RAV4", "RAV4": "RAV4", "راف4": "RAV4",
  "prius": "프리우스", "프리우스": "프리우스",
  "alphard": "알파드", "알파드": "알파드", "الفارد": "알파드",
  "land cruiser": "랜드크루저", "랜드크루저": "랜드크루저", "لاندكروزر": "랜드크루저",
  "highlander": "하이랜더",
  "cayenne": "카이엔", "카이엔": "카이엔", "كايين": "카이엔",
  "macan": "마칸", "마칸": "마칸", "ماكان": "마칸",
  "panamera": "파나메라", "파나메라": "파나메라", "باناميرا": "파나메라",
  "taycan": "타이칸", "타이칸": "타이칸", "تايكان": "타이칸",
  "911": "911", "boxster": "박스터", "cayman": "케이맨",
  "range rover": "레인지로버", "레인지로버": "레인지로버", "رنج روفر": "레인지로버",
  "range rover sport": "레인지로버 스포츠",
  "evoque": "레인지로버 이보크",
  "discovery": "디스커버리", "디스커버리": "디스커버리", "ديسكفري": "디스커버리",
  "defender": "디펜더", "디펜더": "디펜더", "ديفندر": "디펜더",
  "accord": "어코드", "어코드": "어코드", "اكورد": "어코드",
  "civic": "시빅", "시빅": "시빅", "سيفيك": "시빅",
  "cr-v": "CR-V", "crv": "CR-V", "CR-V": "CR-V",
  "qashqai": "캐시카이", "캐시카이": "캐시카이", "قشقاي": "캐시카이",
  "murano": "무라노", "무라노": "무라노", "مورانو": "무라노",
  "patrol": "패트롤", "패트롤": "패트롤", "باترول": "패트롤",
  "q50": "Q50", "q60": "Q60", "q70": "Q70",
  "qx50": "QX50", "qx60": "QX60", "qx70": "QX70", "qx80": "QX80",
  "Q50": "Q50", "QX80": "QX80",
  "mini cooper": "미니쿠퍼", "cooper": "미니쿠퍼", "미니쿠퍼": "미니쿠퍼",
  "countryman": "컨트리맨", "컨트리맨": "컨트리맨",
  "mustang": "머스탱", "머스탱": "머스탱", "موستانج": "머스탱",
  "explorer": "익스플로러", "익스플로러": "익스플로러", "اكسبلورر": "익스플로러",
  "f-150": "F-150", "f150": "F-150",
  "bronco": "브롱코", "브롱코": "브롱코",
  "wrangler": "랭글러", "랭글러": "랭글러", "رانجلر": "랭글러",
  "grand cherokee": "그랜드체로키", "그랜드체로키": "그랜드체로키",
  "compass": "컴패스",
  "navigator": "네비게이터", "네비게이터": "네비게이터", "نافيجيتور": "네비게이터",
  "escalade": "에스컬레이드", "에스컬레이드": "에스컬레이드", "اسكاليد": "에스컬레이드",
  "ct5": "CT5", "ct6": "CT6", "xt4": "XT4", "xt5": "XT5", "xt6": "XT6",
  "model s": "모델 S", "model 3": "모델 3", "model x": "모델 X", "model y": "모델 Y",
  "모델 3": "모델 3", "모델 y": "모델 Y", "موديل 3": "모델 3", "موديل y": "모델 Y",
  "cybertruck": "사이버트럭",
  "ghibli": "기블리", "levante": "레반떼", "레반떼": "레반떼", "ليفانتي": "레반떼",
  "cayenne coupe": "카이엔",
  "cx-5": "CX-5", "cx5": "CX-5", "CX-5": "CX-5",
  "cx-8": "CX-8", "cx-60": "CX-60",
  "outback": "아웃백", "아웃백": "아웃백",
  "forester": "포레스터", "포레스터": "포레스터",
  "giulia": "줄리아", "stelvio": "스텔비오",
  "outlander": "아웃랜더", "아웃랜더": "아웃랜더",
  "continental gt": "컨티넨탈 GT",
  "bentayga": "벤테이가",
  "phantom": "팬텀", "ghost": "고스트", "cullinan": "컬리넌",
  "sierra": "시에라", "acadia": "아카디아", "yukon": "유콘",
  "challenger": "챌린저", "charger": "차저", "durango": "듀랑고",
  "urus": "우루스", "우루스": "우루스",
  "huracan": "우라칸", "aventador": "아벤타도르",
};

const TRANSMISSION_TO_EN: Record<string, string> = {
  "오토": "auto", "수동": "manual", "CVT": "auto", "DCT": "auto",
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
  "white": "흰색", "black": "검정색", "gray": "쥐색", "grey": "쥐색",
  "silver": "은색", "red": "빨간색", "lightblue": "하늘색", "blue": "하늘색",
  "brown": "갈색", "green": "녹색", "yellow": "노란색", "orange": "주황색", "lime": "연두색",
};

function formatPrice(price: number): string {
  const sar = Math.round(price * 27.4);
  return `${price.toLocaleString()}만원 (~${sar.toLocaleString()}﷼)`;
}

// ─────────────────────────────────────────────
// buildEncarQuery — now supports yearFrom/yearTo directly in Encar query
// ─────────────────────────────────────────────
function buildEncarQuery(params: {
  brand?: string;
  model?: string;
  modelType?: "group" | "model"; // "group" = ModelGroup, "model" = Model مباشر
  sunroof?: boolean;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  yearFrom?: number;
  yearTo?: number;
}): { q: string; modelKr: string | null; modelRaw: string | null } {
  let modelKr: string | null = null;
  let modelRaw: string | null = null;

  const KOREAN_MODEL_GROUPS = new Set([
    "아이오닉5", "아이오닉6", "아이오닉9", "아이오닉",
    "아반떼", "쏘나타", "그랜저", "투싼", "싼타페", "팰리세이드",
    "코나", "넥쏘", "베뉴", "캐스퍼", "스타리아", "스타렉스",
    "K3", "K5", "K8", "K9", "스포티지", "쏘렌토", "텔루라이드",
    "모하비", "셀토스", "니로", "카니발", "EV3", "EV6", "EV9",
    "G70", "G80", "G90", "GV60", "GV70", "GV80", "GV90",
  ]);

  let carType = "";
  if (params.brand && params.brand !== "any") {
    const key = params.brand.toLowerCase();
    carType = DOMESTIC_BRANDS.has(key) ? "_.CarType.Y." : "";
  } else if (params.model) {
    const input = params.model.trim();
    const lowerInput = input.toLowerCase();
    const translated = EN_MODEL_TO_KR[lowerInput] ?? EN_MODEL_TO_KR[input] ?? input;
    if (KOREAN_MODEL_GROUPS.has(translated)) {
      carType = "_.CarType.Y.";
    }
  }

  let q = `(And.Hidden.N.${carType}`;

  if (params.brand && params.brand !== "any") {
    const kr = EN_TO_MANUFACTURER[params.brand.toLowerCase()];
    if (kr) q += `_.Manufacturer.${kr}.`;
  }

  if (params.model) {
    const input = params.model.trim();

    // إزالة prefix m: أو g: إذا موجود
    const cleanInput = input.startsWith("m:") ? input.slice(2)
                     : input.startsWith("g:") ? input.slice(2)
                     : input;
    const forceModel = input.startsWith("m:");
    const forceGroup = input.startsWith("g:");

    const isKorean = /[\uAC00-\uD7A3]/.test(cleanInput);

    if (forceModel) {
      q += `_.Model.${cleanInput}.`;
      modelKr = cleanInput;
    } else if (forceGroup) {
      q += `_.ModelGroup.${cleanInput}.`;
      modelKr = cleanInput;
    } else if (isKorean) {
      const group = MODEL_GROUP_MAP[cleanInput];
      if (group) {
        q += `_.ModelGroup.${group}.`;
      } else {
        q += `_.Model.${cleanInput}.`;
      }
      modelKr = cleanInput;
    } else {
      const lowerInput = cleanInput.toLowerCase();
      let translated = EN_MODEL_TO_KR[lowerInput] ?? EN_MODEL_TO_KR[cleanInput];
      if (!translated) {
        const withoutGen = cleanInput.replace(/\s+[A-Z]\d{2,3}$/i, "").trim();
        translated = EN_MODEL_TO_KR[withoutGen.toLowerCase()] ?? EN_MODEL_TO_KR[withoutGen];
      }
      if (!translated) {
        const firstWord = cleanInput.split(" ")[0];
        translated = EN_MODEL_TO_KR[firstWord.toLowerCase()] ?? EN_MODEL_TO_KR[firstWord];
      }
      if (translated) {
        const group = MODEL_GROUP_MAP[translated];
        if (group) {
          q += `_.ModelGroup.${group}.`;
        } else {
          q += `_.Model.${translated}.`;
        }
        modelKr = translated;
      } else {
        modelRaw = cleanInput;
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
  { keywords: ["오토에어컨", "듀얼에어컨", "풀오토에어컨", "풀오토 에어"], id: "auto_ac", ar: "مكيّف تلقائي" },
  { keywords: ["파킹센서", "후방센서", "전방센서", "주차보조", "pdc", "주차센서"], id: "parking_sensor", ar: "حساسات وقوف" },
  { keywords: ["led헤드", "led 헤드", "풀led", "풀 led", "헤드램프 led", "매트릭스led"], id: "led_lights", ar: "مصابيح LED" },
  { keywords: ["어댑티브크루즈", "어댑티브 크루즈", "스마트크루즈", "acc", "scc"], id: "cruise_control", ar: "كروز تكيّفي" },
  { keywords: ["차선이탈", "차선 이탈", "레인킵", "lka", "lda"], id: "lane_assist", ar: "مساعد الحارة" },
  { keywords: ["사각지대", "bsd", "bcw", "후측방경보"], id: "blind_spot", ar: "كشف النقطة العمياء" },
  { keywords: ["헤드업", "hud", "헤드업 디스플레이"], id: "hud", ar: "HUD" },
  { keywords: ["전동시트", "파워시트", "전동 시트"], id: "power_seat", ar: "مقاعد كهربائية" },
  { keywords: ["메모리시트", "메모리 시트"], id: "memory_seat", ar: "مقاعد بذاكرة" },
  { keywords: ["4wd", "awd", "사륜", "4륜", "htrac", "xdrive", "quattro", "4motion"], id: "awd", ar: "دفع رباعي" },
  { keywords: ["하이브리드", "hybrid", "hev"], id: "hybrid", ar: "هجين" },
  { keywords: ["전기차", "전기", "electric", "ev6", "ev3", "ev9", "ioniq", "아이오닉", "모델"], id: "electric", ar: "كهربائي" },
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
      { id: "leather_seat", ar: "مقاعد جلدية" }, { id: "ventilated_seat", ar: "مقاعد مهوّاة" },
      { id: "power_seat", ar: "مقاعد كهربائية" }, { id: "navigation", ar: "ملاحة" },
      { id: "smart_key", ar: "مفتاح ذكي" }, { id: "auto_ac", ar: "مكيّف تلقائي" },
      { id: "camera_rear", ar: "كاميرا خلفية" }, { id: "parking_sensor", ar: "حساسات وقوف" },
      { id: "led_lights", ar: "مصابيح LED" }, { id: "heated_seat", ar: "مقاعد مدفأة" },
    ]) add(o);
  } else if (isPremiumTrim) {
    for (const o of [
      { id: "leather_seat", ar: "مقاعد جلدية" }, { id: "navigation", ar: "ملاحة" },
      { id: "smart_key", ar: "مفتاح ذكي" }, { id: "auto_ac", ar: "مكيّف تلقائي" },
      { id: "camera_rear", ar: "كاميرا خلفية" }, { id: "heated_seat", ar: "مقاعد مدفأة" },
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
  for (const c of car.Condition ?? []) { const label = CONDITION_FEATURE_MAP[c]; if (label) add(label); }
  for (const t of car.Trust ?? []) { const label = TRUST_FEATURE_MAP[t]; if (label) add(label); }
  for (const sm of car.ServiceMark ?? []) { const label = SERVICE_MARK_MAP[sm]; if (label) { add(label); break; } }
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
      "Renault Samsung", "Renault Korea", "Chevrolet", "Daewoo",
      "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Volvo",
      "Toyota", "Lexus", "Honda", "Nissan", "Infiniti",
      "Porsche", "Land Rover", "MINI", "Ford", "Jeep",
      "Lincoln", "Cadillac", "Maserati", "Ferrari", "Lamborghini",
      "Tesla", "Mazda", "Subaru", "Alfa Romeo", "Mitsubishi",
      "Chrysler", "Peugeot", "Citroen", "Bentley", "Rolls-Royce", "McLaren",
      "GMC", "Dodge", "Polestar", "Fiat", "Hummer", "Saab",
      "Lotus", "BYD", "Maybach",
    ],
  });
});

// ─────────────────────────────────────────────
// /filters — يجيب ModelGroups أو Models من Encar مباشرة
// GET /filters?brand=Hyundai               → قائمة ModelGroups
// GET /filters?brand=Hyundai&modelGroup=아반떼 → قائمة Models (الأجيال)
// ─────────────────────────────────────────────
router.get("/filters", async (req, res) => {
  const { brand, modelGroup } = req.query as { brand?: string; modelGroup?: string };

  if (!brand) {
    res.status(400).json({ error: "brand is required" });
    return;
  }

  const krBrand = EN_TO_MANUFACTURER[brand.toLowerCase()];
  if (!krBrand) {
    res.status(400).json({ error: "unknown brand" });
    return;
  }

  const isDomestic = DOMESTIC_BRANDS.has(brand.toLowerCase());
  const carTypePart = isDomestic ? "_.CarType.Y." : "";

  try {
    let q: string;

    if (modelGroup) {
      // نجيب Models (الأجيال) لـ ModelGroup معين
      q = `(And.Hidden.N.${carTypePart}_.Manufacturer.${krBrand}._.ModelGroup.${modelGroup}.)`;
    } else {
      // نجيب ModelGroups للماركة
      q = `(And.Hidden.N.${carTypePart}_.Manufacturer.${krBrand}.)`;
    }

    const inavParam = modelGroup
      ? encodeURIComponent("|Metadata|Sort")  // عند ModelGroup محدد، Encar يرجع Models في nodes
      : encodeURIComponent("|Metadata|Sort");
    const rawUrl = `${ENCAR_API}/search/car/list/premium?count=true&q=${q}&inav=${inavParam}`;
    const resp = await fetch(rawUrl, {
      headers: {
        Referer: "https://www.encar.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`Encar HTTP ${resp.status}`);
    const data = await resp.json() as { iNav?: { Nodes?: any[] } };
    const nodes = data.iNav?.Nodes ?? [];

    // DEBUG: إذا modelGroup موجود، نرجع الـ nodes names للتشخيص
    if (modelGroup && req.query.debug === "1") {
      res.json({
        nodeNames: nodes.map((n: any) => n.Name),
        rawNodes: nodes.slice(0, 5),
      });
      return;
    }

    if (modelGroup) {
      // Models داخل Refinements داخل ModelGroup facet
      // أولاً نحاول نجيبها من Node مباشر
      const modelNode = nodes.find((n: any) => n.Name === "Model");
      let modelFacets = (modelNode?.Facets ?? []).filter((f: any) => f.Count > 0);

      // إذا ما لقينا، نبحث في Refinements داخل ModelGroup node
      if (modelFacets.length === 0) {
        const mgNode = nodes.find((n: any) => n.Name === "ModelGroup");
        const mgFacet = mgNode?.Facets?.find((f: any) => f.Value === modelGroup || f.IsSelected);
        const refinementModel = mgFacet?.Refinements?.Nodes?.find((n: any) => n.Name === "Model");
        modelFacets = (refinementModel?.Facets ?? []).filter((f: any) => f.Count > 0);
      }

      // إذا ما لقينا بعد، نبحث في أي Refinements في أي node
      if (modelFacets.length === 0) {
        for (const node of nodes) {
          for (const facet of node.Facets ?? []) {
            const refModel = facet?.Refinements?.Nodes?.find((n: any) => n.Name === "Model");
            if (refModel?.Facets?.length > 0) {
              modelFacets = refModel.Facets.filter((f: any) => f.Count > 0);
              break;
            }
          }
          if (modelFacets.length > 0) break;
        }
      }

      const models = modelFacets.map((f: any) => ({
        value: f.Value,
        label: f.DisplayValue,
        count: f.Count,
      }));
      res.json({ models });
    } else {
      // نستخرج ModelGroups من iNav
      const mgNode = nodes.find((n: any) => n.Name === "ModelGroup");
      // ModelGroups تكون في Refinements داخل Manufacturer facet
      const mfNode = nodes.find((n: any) => n.Name === "Manufacturer");
      const krFacet = mfNode?.Facets?.find((f: any) => f.Value === krBrand);
      const refinementMG = krFacet?.Refinements?.Nodes?.find((n: any) => n.Name === "ModelGroup");

      const rawGroups = refinementMG?.Facets ?? mgNode?.Facets ?? [];
      const modelGroups = rawGroups
        .filter((f: any) => f.Count > 0)
        .map((f: any) => ({
          value: f.Value,
          label: f.DisplayValue,
          count: f.Count,
        }));
      res.json({ modelGroups });
    }
  } catch (err) {
    req.log.error({ err }, "Encar filters error");
    res.status(502).json({ error: "upstream_error" });
  }
});

router.get("/search", async (req, res) => {
  const parsed = SearchCarsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_params", message: "Invalid query parameters" });
    return;
  }
  const {
    model, brand, yearFrom, yearTo, sunroof, transmission,
    fuelType, bodyType, color, priceMin, priceMax, mileageMax,
    page = 1, limit = 20,
  } = parsed.data;
  // modelType: "group" أو "model" — يُرسل من filter-sidebar
  const modelType = (req.query.modelType as "group" | "model" | undefined);
  try {
    const { q: encarQ, modelRaw } = buildEncarQuery({
      brand, model, sunroof, fuelType, transmission, bodyType, color,
      yearFrom, yearTo, modelType,
    });
    const offset = (page - 1) * limit;
    const url = new URL(`${ENCAR_API}/search/car/list/general`);
    url.searchParams.set("count", "true");
    url.searchParams.set("q", encarQ);
    url.searchParams.set("sr", `|ModifiedDate|${offset}|${limit}`);
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
