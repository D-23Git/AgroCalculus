import React, { useState, useEffect } from "react";
import "./SchemesPage.css";
import api from '../utils/apiService';
import AdBanner from "./AdBanner";

const SCHEMES = [
  {
    id: 1,
    icon: "💰",
    category: { en: "Direct Benefit", mr: "थेट लाभ" },
    name: { en: "PM Kisan Samman Nidhi", mr: "पीएम किसान सन्मान निधी" },
    benefit: { en: "₹6,000 per year (3 installments)", mr: "₹६,००० प्रति वर्ष (३ हप्ते)" },
    eligibility: { en: "All land-holding farmer families", mr: "सर्व जमीनधारक शेतकरी कुटुंबे" },
    desc: {
      en: "Direct income support of ₹6,000 per year transferred to farmer's bank account in 3 equal installments of ₹2,000 each.",
      mr: "शेतकऱ्यांच्या बँक खात्यात ₹६,००० प्रतिवर्ष ३ हप्त्यांत (प्रत्येकी २,०००) थेट जमा."
    },
    docs: {
      en: ["Aadhar Card", "Land Records (7/12)", "Bank Passbook", "Mobile Number"],
      mr: ["आधार कार्ड", "सातबारा उतारा", "बँक पासबुक", "मोबाईल नंबर"]
    },
    link: "https://pmkisan.gov.in",
    color: "#10b981",
    status: { en: "Active Now", mr: "सध्या सुरू" },
    popular: true,
    trending: true
  },
  {
    id: 101,
    icon: "🏦",
    category: { en: "Maharashtra Special", mr: "महाराष्ट्र विशेष" },
    name: { en: "Namo Shetkari Mahasanman", mr: "नमो शेतकरी महासन्मान निधी" },
    benefit: { en: "₹6,000 per year (MH State addition)", mr: "₹६,००० प्रति वर्ष (राज्य सरकार)" },
    eligibility: { en: "All PM-Kisan beneficiaries in MH", mr: "महाराष्ट्रातील सर्व पीएम-किसान लाभार्थी" },
    desc: {
      en: "Maharashtra state govt provides additional ₹6,000 per year, making it total ₹12,000 for state farmers.",
      mr: "राज्य सरकारकडून अतिरिक्त ₹६,०००, यामुळे महाराष्ट्रातील शेतकऱ्यांना आता एकूण ₹१२,००० मिळतात."
    },
    docs: {
      en: ["Aadhar Card", "PM-Kisan ID", "Bank Account Details"],
      mr: ["आधार कार्ड", "पीएम-किसान आयडी", "बँक तपशील"]
    },
    link: "https://nsmn.maharashtra.gov.in",
    color: "#f59e0b",
    status: { en: "Active", mr: "सक्रिय" },
    popular: true,
    trending: true
  },
  {
    id: 2,
    icon: "🛡️",
    category: { en: "Insurance", mr: "विमा" },
    name: { en: "PM Fasal Bima Yojana (PMFBY)", mr: "पीएम फसल बीमा योजना" },
    benefit: { en: "Low premium crop insurance", mr: "कमी प्रीमियममध्ये पीक विमा" },
    eligibility: { en: "All farmers including sharecroppers", mr: "भाडेतत्त्वावरील शेतकऱ्यांसह सर्व शेतकरी" },
    desc: {
      en: "Comprehensive insurance against crop failure due to natural calamities, pests, and diseases. Kharif premium 2%, Rabi 1.5%.",
      mr: "नैसर्गिक आपत्ती, कीड व रोगांमुळे होणाऱ्या पीक नुकसानीसाठी सर्वसमावेशक विमा. खरीप २%, रब्बी १.५% प्रीमियम."
    },
    docs: {
      en: ["Aadhar Card", "Sowing Certificate", "Land Documents", "Bank Details"],
      mr: ["आधार कार्ड", "पीक पेरा प्रमाणपत्र", "सातबारा उतारा", "बँक तपशील"]
    },
    link: "https://pmfby.gov.in",
    color: "#3b82f6",
    status: { en: "Season-wise", mr: "हंगामानुसार" },
    popular: true
  },
  {
    id: 11,
    icon: "🌧️",
    category: { en: "Maharashtra Special", mr: "महाराष्ट्र विशेष" },
    name: { en: "PoCRA (Krishi Sanjivani)", mr: "पोकरा (कृषी संजीवनी)" },
    benefit: { en: "₹50,000 to ₹1 Lakh for climate resilience", mr: "हवामान अनुकूल शेतीसाठी ₹१ लाखांपर्यंत" },
    eligibility: { en: "Drought prone area farmers in MH", mr: "महाराष्ट्रातील दुष्काळग्रस्त भागातील शेतकरी" },
    desc: {
      en: "Promotes climate resilient agriculture for small and marginal farmers in 15 districts of Maharashtra.",
      mr: "महाराष्ट्रातील १५ जिल्ह्यांतील अल्प भूधारक शेतकऱ्यांसाठी हवामान अनुकूल शेतीला प्रोत्साहन."
    },
    docs: {
      en: ["Aadhar Card", "7/12 Extract", "Bank Passbook"],
      mr: ["आधार कार्ड", "सातबारा उतारा", "बँक पासबुक"]
    },
    link: "https://pocrana.mahait.org",
    color: "#f43f5e",
    status: { en: "Active", mr: "सक्रिय" },
    popular: true
  },
  {
    id: 3,
    icon: "☀️",
    category: { en: "Solar Energy", mr: "सौर ऊर्जा" },
    name: { en: "PM KUSUM Yojana", mr: "पीएम कुसुम योजना" },
    benefit: { en: "Solar pump with 90% subsidy", mr: "९०% सबसिडीसह सौर पंप" },
    eligibility: { en: "Farmers with agricultural land", mr: "शेतजमीन असलेले शेतकरी" },
    desc: {
      en: "Install solar pumps for irrigation with massive subsidy (60% Central + 30% State Govt). Drastically reduces electricity bills.",
      mr: "सिंचनासाठी सौर पंप बसवा. केंद्र ६०% + राज्य ३०% अनुदान. वीज बिलात मोठी बचत."
    },
    docs: {
      en: ["Aadhar Card", "Caste Certificate (if applicable)", "Bank Details", "Passport Photo"],
      mr: ["आधार कार्ड", "जातीचा दाखला (लागू असल्यास)", "बँक खाते", "फोटो"]
    },
    link: "https://mnre.gov.in",
    color: "#f59e0b",
    status: { en: "Open Now", mr: "सध्या सुरू" },
    popular: false,
    trending: true
  },
  {
    id: 14,
    icon: "💧",
    category: { en: "Irrigation", mr: "सिंचन" },
    name: { en: "Magel Tyala Shetale", mr: "मागेल त्याला शेततळे" },
    benefit: { en: "₹50,000 for farm pond construction", mr: "शेततळे बांधण्यासाठी ₹५०,०००" },
    eligibility: { en: "Farmers with 0.60+ hectare land", mr: "०.६० हेक्टर पेक्षा जास्त जमीन असलेले शेतकरी" },
    desc: {
      en: "Demand based farm pond scheme to ensure protective irrigation during dry spells.",
      mr: "पावसाच्या खंडात पिकांना पाणी देण्यासाठी मागणीनुसार शेततळे देणारी योजना."
    },
    docs: {
      en: ["7/12 Extract", "Aadhar Card", "Bank Details"],
      mr: ["सातबारा उतारा", "आधार कार्ड", "बँक तपशील"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#0284c7",
    status: { en: "Active", mr: "सक्रिय" },
    popular: true
  },
  {
    id: 110,
    icon: "💧",
    category: { en: "Irrigation", mr: "सिंचन" },
    name: { en: "PM Krishi Sinchai Yojana", mr: "प्रधानमंत्री कृषी सिंचन योजना" },
    benefit: { en: "55% to 80% subsidy for Drip/Sprinkler", mr: "ठिबक/तुषार सिंचनासाठी ५५% ते ८०% अनुदान" },
    eligibility: { en: "Farmers with valid land documents", mr: "वैध कागदपत्रे असलेले सर्व शेतकरी" },
    desc: {
      en: "Promotes 'More Crop Per Drop' by providing subsidies for efficient irrigation systems like Drip and Sprinkler.",
      mr: "ठिबक आणि तुषार सिंचनासाठी अनुदान देऊन 'प्रति थेंब अधिक पीक' या मोहिमेला प्रोत्साहन."
    },
    docs: {
      en: ["7/12 Extract", "Aadhar Card", "Purchase Quotation"],
      mr: ["सातबारा उतारा", "आधार कार्ड", "कोटेशन"]
    },
    link: "https://pmksy.gov.in",
    color: "#0891b2",
    status: { en: "Active", mr: "सक्रिय" },
    popular: true
  },
  {
    id: 111,
    icon: "📈",
    category: { en: "Direct Benefit", mr: "थेट लाभ" },
    name: { en: "Bhavantar Yojana", mr: "भावांतर योजना (Soybean/Cotton)" },
    benefit: { en: "Compensation for price drops", mr: "भाव घसरल्यास नुकसान भरपाई" },
    eligibility: { en: "Soybean and Cotton growers in MH", mr: "महाराष्ट्रातील कापूस व सोयाबीन उत्पादक" },
    desc: {
      en: "Financial assistance to farmers when market prices fall below the MSP (Minimum Support Price).",
      mr: "बाजारभाव हमीभावापेक्षा कमी झाल्यास शेतकऱ्यांना आर्थिक मदत."
    },
    docs: {
      en: ["7/12 Extract", "Aadhar Card", "Sale Receipt"],
      mr: ["सातबारा उतारा", "आधार कार्ड", "विक्री पावती"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#10b981",
    status: { en: "Ongoing", mr: "सुरू" },
    popular: true,
    trending: true
  },
  {
    id: 5,
    icon: "💳",
    category: { en: "Credit", mr: "कर्ज" },
    name: { en: "Kisan Credit Card (KCC)", mr: "किसान क्रेडिट कार्ड (KCC)" },
    benefit: { en: "₹3 Lakh loan at 4% interest", mr: "₹३ लाख कर्ज ४% व्याजावर" },
    eligibility: { en: "Farmers, animal husbandry & fisheries", mr: "शेतकरी, पशुपालक व मच्छिमार" },
    desc: {
      en: "Short-term credit for farmers to meet their financial requirements for cultivation and other needs.",
      mr: "शेती कामांसाठी आणि इतर गरजांसाठी शेतकऱ्यांना सुलभ अल्पमुदतीचे कर्ज उपलब्ध करून देणे."
    },
    docs: {
      en: ["Application Form", "Aadhar Card", "Land Records"],
      mr: ["अर्ज", "आधार कार्ड", "सातबारा उतारा"]
    },
    link: "https://pmkisan.gov.in",
    color: "#ec4899",
    status: { en: "Ongoing", mr: "नेहमी सुरू" },
    popular: true
  },
  {
    id: 112,
    icon: "🚜",
    category: { en: "Machinery", mr: "यंत्रसामग्री" },
    name: { en: "State Agri Mechanization", mr: "राज्य कृषी यांत्रिकीकरण योजना" },
    benefit: { en: "Subsidy for Tractors & Tools", mr: "ट्रॅक्टर आणि अवजारांसाठी अनुदान" },
    eligibility: { en: "All farmers in Maharashtra", mr: "महाराष्ट्रातील सर्व शेतकरी" },
    desc: {
      en: "Providing subsidies for purchase of tractors, power tillers, and other farm machinery to reduce manual labor.",
      mr: "श्रम कमी करण्यासाठी ट्रॅक्टर, पॉवर टिलर आणि इतर यंत्रसामग्रीच्या खरेदीसाठी अनुदान."
    },
    docs: {
      en: ["Aadhar Card", "Quotation", "Land Records", "Caste Certificate"],
      mr: ["आधार कार्ड", "कोटेशन", "सातबारा उतारा", "जातीचा दाखला"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#64748b",
    status: { en: "First-come First-served", mr: "प्रथम येणाऱ्यास प्राधान्य" },
    popular: true
  },
  {
    id: 12,
    icon: "🏥",
    category: { en: "Insurance", mr: "विमा" },
    name: { en: "Gopinath Munde Insurance", mr: "गोपीनाथ मुंडे शेतकरी विमा" },
    benefit: { en: "₹2 Lakh accident cover", mr: "₹२ लाख अपघात विमा कवच" },
    eligibility: { en: "All registered farmers in MH", mr: "महाराष्ट्रातील सर्व नोंदणीकृत शेतकरी" },
    desc: {
      en: "Financial assistance for family in case of accidental death or permanent disability of the farmer.",
      mr: "शेतकऱ्याचा अपघाती मृत्यू किंवा अपंगत्व आल्यास कुटुंबाला आर्थिक मदत."
    },
    docs: {
      en: ["FIR Copy", "7/12 Extract", "Death Certificate"],
      mr: ["एफआयआर प्रत", "सातबारा उतारा", "मृत्यू दाखला"]
    },
    link: "https://krishi.maharashtra.gov.in",
    color: "#ef4444",
    status: { en: "Active", mr: "सक्रिय" },
    popular: true
  },
  {
    id: 113,
    icon: "🧪",
    category: { en: "Soil Care", mr: "माती आरोग्य" },
    name: { en: "Soil Health Card Scheme", mr: "मृदा आरोग्य कार्ड योजना" },
    benefit: { en: "Free soil testing & recommendations", mr: "मोफत माती तपासणी व शिफारसी" },
    eligibility: { en: "All Indian farmers", mr: "सर्व भारतीय शेतकरी" },
    desc: {
      en: "Soil nutrient analysis and advice on the appropriate dose of fertilizers for different crops.",
      mr: "मातीतील पोषक घटकांचे विश्लेषण आणि विविध पिकांसाठी खतांच्या योग्य डोसबाबत सल्ला."
    },
    docs: {
      en: ["Soil Sample", "Aadhar Card"],
      mr: ["मातीचा नमुना", "आधार कार्ड"]
    },
    link: "https://soilhealth.dac.gov.in",
    color: "#8b5cf6",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 15,
    icon: "🍇",
    category: { en: "Horticulture", mr: "फलोत्पादन" },
    name: { en: "Fruit Orchard Scheme", mr: "फळबाग लागवड योजना (MGNREGS)" },
    benefit: { en: "100% subsidy for plantation", mr: "लागवडीसाठी १००% अनुदान" },
    eligibility: { en: "All farmers in Maharashtra", mr: "महाराष्ट्रातील सर्व शेतकरी" },
    desc: {
      en: "Full subsidy for planting Mango, Pomegranate, and other fruit trees under MGNREGS.",
      mr: "रोजगार हमी योजनेअंतर्गत आंबा, डाळिंब आणि इतर फळबाग लागवडीसाठी पूर्ण अनुदान."
    },
    docs: {
      en: ["Land Records", "MGNREGS Job Card", "Identity Proof"],
      mr: ["सातबारा उतारा", "जॉब कार्ड", "ओळखपत्र"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#65a30d",
    status: { en: "Active", mr: "सक्रिय" },
    popular: false
  },
  {
    id: 114,
    icon: "🛖",
    category: { en: "Horticulture", mr: "फलोत्पादन" },
    name: { en: "Onion Storage (Kanda Chal)", mr: "कांदा चाळ योजना" },
    benefit: { en: "Subsidy for storage structures", mr: "कांदा साठवणुकीसाठी अनुदान" },
    eligibility: { en: "Onion producing farmers", mr: "कांदा उत्पादक शेतकरी" },
    desc: {
      en: "Providing financial aid to build scientific storage structures for onions to prevent spoilage.",
      mr: "कांद्याचे नुकसान टाळण्यासाठी वैज्ञानिक पद्धतीने साठवणूक चाळ बांधण्यासाठी आर्थिक मदत."
    },
    docs: {
      en: ["Aadhar Card", "7/12 Extract", "Quotation"],
      mr: ["आधार कार्ड", "सातबारा उतारा", "कोटेशन"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#b91c1c",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 13,
    icon: "🚜",
    category: { en: "Machinery", mr: "यंत्रसामग्री" },
    name: { en: "Birsa Munda Krishi Kranti", mr: "बिरसा मुंडा कृषी क्रांती योजना" },
    benefit: { en: "Subsidy for wells and tools", mr: "विहीर आणि शेती साहित्यासाठी अनुदान" },
    eligibility: { en: "ST Category farmers in MH", mr: "महाराष्ट्रातील अ.ज. प्रवर्गातील शेतकरी" },
    desc: {
      en: "Empowering tribal farmers by providing permanent irrigation facilities and modern farming tools.",
      mr: "आदिवासी शेतकऱ्यांना सिंचन सुविधा आणि आधुनिक शेती साहित्य देऊन सक्षम करणे."
    },
    docs: {
      en: ["Caste Certificate", "Income Certificate", "Land Records"],
      mr: ["जातीचा दाखला", "उत्पन्नाचा दाखला", "सातबारा उतारा"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#ea580c",
    status: { en: "Active", mr: "सक्रिय" },
    popular: false
  },
  {
    id: 17,
    icon: "🐄",
    category: { en: "Dairy", mr: "दुग्धव्यवसाय" },
    name: { en: "Ambedkar Krishi Swavalamban", mr: "डॉ. आंबेडकर कृषी स्वावलंबन योजना" },
    benefit: { en: "Up to ₹2.5 Lakh subsidy", mr: "₹२.५ लाखांपर्यंत अनुदान" },
    eligibility: { en: "SC Category farmers in MH", mr: "महाराष्ट्रातील अ.जा. प्रवर्गातील शेतकरी" },
    desc: {
      en: "Providing self-employment to SC farmers through modern irrigation and tools.",
      mr: "आधुनिक सिंचन आणि साहित्याद्वारे अ.जा. शेतकऱ्यांना स्वयंरोजगार उपलब्ध करून देणे."
    },
    docs: {
      en: ["Caste Certificate", "Income Certificate", "Land Records"],
      mr: ["जातीचा दाखला", "उत्पन्नाचा दाखला", "सातबारा उतारा"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#8b5cf6",
    status: { en: "Active", mr: "सक्रिय" },
    popular: false
  },
  {
    id: 115,
    icon: "🐄",
    category: { en: "Dairy", mr: "दुग्धव्यवसाय" },
    name: { en: "Milch Animal Subsidy", mr: "दुभत्या जनावरांचे वाटप" },
    benefit: { en: "50% to 75% subsidy for cows/buffaloes", mr: "गाई/म्हशी खरेदीसाठी ५०% ते ७५% अनुदान" },
    eligibility: { en: "Small farmers, landless laborers", mr: "अल्पभूधारक शेतकरी, शेतमजूर" },
    desc: {
      en: "Distribution of high-yielding milch animals (Cow/Buffalo) to boost rural economy and self-employment.",
      mr: "ग्रामीण अर्थव्यवस्था आणि स्वयंरोजगाराला चालना देण्यासाठी दुभत्या जनावरांचे वाटप."
    },
    docs: {
      en: ["Aadhar Card", "Bank Account", "BPL Card (if any)"],
      mr: ["आधार कार्ड", "बँक खाते", "बीपीएल कार्ड (असल्यास)"]
    },
    link: "https://ahd.maharashtra.gov.in",
    color: "#f97316",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 16,
    icon: "🐚",
    category: { en: "Fisheries", mr: "मत्स्यव्यवसाय" },
    name: { en: "Matsya Sampada Yojana", mr: "मत्स्य संपदा योजना" },
    benefit: { en: "40% to 60% subsidy", mr: "४०% ते ६०% अनुदान" },
    eligibility: { en: "Fish farmers and SHGs", mr: "मत्स्यपालक आणि बचत गट" },
    desc: {
      en: "Holistic development of fisheries sector through financial and technical support.",
      mr: "आर्थिक आणि तांत्रिक मदतीद्वारे मत्स्यव्यवसाय क्षेत्राचा सर्वांगीण विकास."
    },
    docs: {
      en: ["Fisheries License", "Aadhar Card", "Project Report"],
      mr: ["मत्स्यव्यवसाय परवाना", "आधार कार्ड", "प्रकल्प अहवाल"]
    },
    link: "https://pmmsy.dof.gov.in",
    color: "#0ea5e9",
    status: { en: "Active", mr: "सक्रिय" },
    popular: false
  },
  {
    id: 116,
    icon: "🐐",
    category: { en: "Dairy", mr: "दुग्धव्यवसाय" },
    name: { en: "Goat/Sheep Rearing", mr: "शेळी/मेंढी पालन योजना" },
    benefit: { en: "Unit of 10+1 animals with subsidy", mr: "१०+१ शेळी/मेंढी युनिटवर अनुदान" },
    eligibility: { en: "Unemployed youth, farmers", mr: "बेरोजगार युवक, शेतकरी" },
    desc: {
      en: "Providing financial aid for starting small-scale goat and sheep rearing units for meat and wool.",
      mr: "मांस आणि लोकरीसाठी लहान प्रमाणात शेळी आणि मेंढी पालन व्यवसाय सुरू करण्यास आर्थिक मदत."
    },
    docs: {
      en: ["Aadhar Card", "Caste Certificate", "Land Records"],
      mr: ["आधार कार्ड", "जातीचा दाखला", "सातबारा उतारा"]
    },
    link: "https://ahd.maharashtra.gov.in",
    color: "#854d0e",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 117,
    icon: "🥗",
    category: { en: "Horticulture", mr: "फलोत्पादन" },
    name: { en: "Greenhouse / Polyhouse", mr: "हरितगृह / पॉलिहाउस योजना" },
    benefit: { en: "Up to 50% subsidy on project cost", mr: "प्रकल्प खर्चावर ५०% पर्यंत अनुदान" },
    eligibility: { en: "Farmers with irrigation source", mr: "पाण्याचा स्रोत असलेले शेतकरी" },
    desc: {
      en: "Assistance for high-tech farming of flowers and high-value vegetables under protected structures.",
      mr: "फुले आणि महागड्या भाजीपाला लागवडीसाठी संरक्षित शेती (पॉलिहाउस) उभारण्यास मदत."
    },
    docs: {
      en: ["Project Report", "Aadhar Card", "7/12 Extract"],
      mr: ["प्रकल्प अहवाल", "आधार कार्ड", "सातबारा उतारा"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#16a34a",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 18,
    icon: "🥦",
    category: { en: "Vegetable", mr: "भाजीपाला" },
    name: { en: "Integrated Vegetable Production", mr: "एकात्मिक भाजीपाला उत्पादन" },
    benefit: { en: "Subsidy for seeds and mulch", mr: "बियाणे आणि मल्चिंगसाठी अनुदान" },
    eligibility: { en: "Small and marginal farmers", mr: "अल्प व अत्यल्प भूधारक शेतकरी" },
    desc: {
      en: "Assistance for high-yield vegetable cultivation and plastic mulching setup.",
      mr: "भाजीपाला लागवड आणि प्लास्टिक मल्चिंगसाठी अर्थसाहाय्य."
    },
    docs: {
      en: ["7/12 Extract", "Aadhar Card", "Bank Details"],
      mr: ["सातबारा उतारा", "आधार कार्ड", "बँक तपशील"]
    },
    link: "https://krishi.maharashtra.gov.in",
    color: "#16a34a",
    status: { en: "Active", mr: "सक्रिय" },
    popular: false
  },
  {
    id: 19,
    icon: "🔌",
    category: { en: "Solar Energy", mr: "सौर ऊर्जा" },
    name: { en: "Agri Solar Feeder Scheme", mr: "कृषी सौर वाहिनी योजना" },
    benefit: { en: "Daytime power for agri pumps", mr: "शेती पंपांसाठी दिवसा वीज" },
    eligibility: { en: "Agri pump owners in MH", mr: "महाराष्ट्रातील शेती पंप धारक" },
    desc: {
      en: "Solarizing agri-feeders to ensure reliable daytime power supply for irrigation.",
      mr: "सिंचनासाठी दिवसा खात्रीशीर वीज पुरवठा करण्यासाठी कृषी वाहिन्यांचे सौर ऊर्जीकरण."
    },
    docs: {
      en: ["Electricity Bill", "Aadhar Card", "7/12 Extract"],
      mr: ["वीज बिल", "आधार कार्ड", "सातबारा उतारा"]
    },
    link: "https://mahadiscom.in",
    color: "#fbbf24",
    status: { en: "Ongoing", mr: "सुरू" },
    popular: false
  },
  {
    id: 118,
    icon: "🐝",
    category: { en: "Horticulture", mr: "फलोत्पादन" },
    name: { en: "Bee-Keeping (Honey)", mr: "मधुमक्षिका पालन" },
    benefit: { en: "Subsidy for bee boxes", mr: "मधुमाशांच्या पेट्यांसाठी अनुदान" },
    eligibility: { en: "Small farmers, SHGs", mr: "अल्पभूधारक शेतकरी, बचत गट" },
    desc: {
      en: "Promoting bee-keeping for honey production and better pollination of crops.",
      mr: "मध उत्पादनासाठी आणि पिकांच्या परागीकरणासाठी मधुमक्षिका पालनास प्रोत्साहन."
    },
    docs: {
      en: ["Aadhar Card", "Bank Details", "Training Certificate (if any)"],
      mr: ["आधार कार्ड", "बँक तपशील", "प्रशिक्षण प्रमाणपत्र"]
    },
    link: "https://mahadbt.maharashtra.gov.in",
    color: "#fde047",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 20,
    icon: "🏠",
    category: { en: "Housing", mr: "घरकुल" },
    name: { en: "PM Awas Yojana (Rural)", mr: "पीएम आवास योजना (ग्रामीण)" },
    benefit: { en: "₹1.2 Lakh for new house", mr: "नवीन घरासाठी ₹१.२ लाख" },
    eligibility: { en: "Rural homeless families", mr: "ग्रामीण भागातील बेघर कुटुंबे" },
    desc: {
      en: "Financial assistance to construct a pucca house with basic amenities for the rural poor.",
      mr: "ग्रामीण भागातील गरिबांना मूलभूत सोयींसह पक्के घर बांधण्यासाठी आर्थिक मदत."
    },
    docs: {
      en: ["Income Certificate", "Aadhar Card", "Ration Card"],
      mr: ["उत्पन्नाचा दाखला", "आधार कार्ड", "रेशन कार्ड"]
    },
    link: "https://pmayg.nic.in",
    color: "#c2410c",
    status: { en: "Active", mr: "सक्रिय" },
    popular: true
  },
  {
    id: 119,
    icon: "🧤",
    category: { en: "Direct Benefit", mr: "थेट लाभ" },
    name: { en: "MGNREGA Work", mr: "नरेगा मजदूरी" },
    benefit: { en: "100 days guaranteed work", mr: "१०० दिवस कामाची हमी" },
    eligibility: { en: "Rural unemployed adults", mr: "ग्रामीण भागातील बेरोजगार" },
    desc: {
      en: "Legal guarantee for at least 100 days of employment in a financial year to every rural household.",
      mr: "ग्रामीण भागातील प्रत्येक कुटुंबाला वर्षातून किमान १०० दिवस कामाची कायदेशीर हमी."
    },
    docs: {
      en: ["Job Card", "Aadhar Card", "Bank Passbook"],
      mr: ["जॉब कार्ड", "आधार कार्ड", "बँक पासबुक"]
    },
    link: "https://nrega.nic.in",
    color: "#d97706",
    status: { en: "Always Open", mr: "नेहमी सुरू" }
  },
  {
    id: 120,
    icon: "🛰️",
    category: { en: "Direct Benefit", mr: "थेट लाभ" },
    name: { en: "Digital Sat-bara", mr: "डिजिटल सात-बारा" },
    benefit: { en: "Online land records", mr: "ऑनलाइन सात-बारा उतारा" },
    eligibility: { en: "Landowners in MH", mr: "महाराष्ट्रातील जमीनमालक" },
    desc: {
      en: "Access verified digital copies of land records (7/12, 8A) for official purposes anytime.",
      mr: "शासकीय कामांसाठी डिजिटल स्वाक्षरी असलेला सात-बारा आणि ८अ उतारा ऑनलाइन मिळवा."
    },
    docs: {
      en: ["Survey Number", "Mobile Number"],
      mr: ["गट नंबर", "मोबाईल नंबर"]
    },
    link: "https://bhulekh.mahabhumi.gov.in",
    color: "#2563eb",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 121,
    icon: "📱",
    category: { en: "Direct Benefit", mr: "थेट लाभ" },
    name: { en: "E-Pik Pahani", mr: "ई-पीक पाहणी" },
    benefit: { en: "Self-recording of crops", mr: "स्वतःच्या पिकाची नोंदणी" },
    eligibility: { en: "All farmers in MH", mr: "महाराष्ट्रातील सर्व शेतकरी" },
    desc: {
      en: "Mobile app for farmers to record their own crops in the 7/12 records for insurance and aid.",
      mr: "पीक विमा आणि मदतीसाठी शेतकऱ्यांनी स्वतः आपल्या पिकाची नोंद सात-बारावर करण्यासाठी ॲप."
    },
    docs: {
      en: ["Mobile App", "7/12 Extract"],
      mr: ["मोबाईल ॲप", "सातबारा उतारा"]
    },
    link: "https://pikirani.gov.in",
    color: "#8b5cf6",
    status: { en: "Seasonal", mr: "हंगामी" }
  },
  {
    id: 130,
    icon: "💳",
    category: { en: "Financial Aid", mr: "आर्थिक मदत" },
    name: { en: "Kisan Credit Card (KCC)", mr: "किसान क्रेडिट कार्ड (KCC)" },
    benefit: { en: "Loans up to ₹3 Lakh at 4% interest", mr: "४% व्याजावर ₹३ लाखांपर्यंत कर्ज" },
    eligibility: { en: "All farmers and livestock owners", mr: "सर्व शेतकरी आणि पशुपालक" },
    desc: {
      en: "Provides timely credit to farmers for their cultivation and other needs at very low interest rates.",
      mr: "शेतकऱ्यांना शेती आणि इतर गरजांसाठी अत्यंत कमी व्याजदरात वेळेवर कर्ज उपलब्ध करून देणे."
    },
    docs: {
      en: ["Land Record Documents", "Aadhar Card", "Bank Account Details"],
      mr: ["सातबारा उतारा", "आधार कार्ड", "बँक खाते तपशील"]
    },
    link: "https://www.myscheme.gov.in/schemes/kcc",
    color: "#16a34a",
    status: { en: "Always Open", mr: "नेहमी सुरू" },
    popular: true
  },
  {
    id: 131,
    icon: "🌿",
    category: { en: "Organic Farming", mr: "सेंद्रिय शेती" },
    name: { en: "Paramparagat Krishi Vikas Yojana", mr: "परंपरागत कृषी विकास योजना" },
    benefit: { en: "₹50,000 per hectare subsidy", mr: "₹५०,००० प्रति हेक्टर अनुदान" },
    eligibility: { en: "Farmers in clusters (50+ acres)", mr: "गटातील शेतकरी (५०+ एकर)" },
    desc: {
      en: "Supports organic farming through a cluster approach and PGDS certification. Financial assistance for inputs.",
      mr: "सेंद्रिय शेतीला प्रोत्साहन देण्यासाठी आर्थिक मदत आणि प्रमाणीकरण सुविधा."
    },
    docs: {
      en: ["Cluster Certificate", "Land Documents", "Group ID"],
      mr: ["गट प्रमाणपत्र", "जमिनीची कागदपत्रे", "ग्रुप आयडी"]
    },
    link: "https://pgsindia-ncof.gov.in",
    color: "#059669",
    status: { en: "Active", mr: "सक्रिय" }
  },
  {
    id: 132,
    icon: "🧪",
    category: { en: "Soil Care", mr: "मृदा आरोग्य" },
    name: { en: "Soil Health Card Scheme", mr: "मृदा आरोग्य पत्रिका योजना" },
    benefit: { en: "Free soil testing every 2 years", mr: "दर २ वर्षांनी मोफत माती परीक्षण" },
    eligibility: { en: "All land-holding farmers", mr: "सर्व जमीनधारक शेतकरी" },
    desc: {
      en: "Provides farmers with crop-wise recommendations of nutrients and fertilizers required for their farms.",
      mr: "शेतकऱ्यांना त्यांच्या शेतातील मातीनुसार खते आणि पोषक तत्वांची माहिती देणे."
    },
    docs: {
      en: ["Soil Sample", "Land Documents", "Aadhar Card"],
      mr: ["मातीचा नमुना", "सातबारा उतारा", "आधार कार्ड"]
    },
    link: "https://soilhealth.dac.gov.in",
    color: "#92400e",
    status: { en: "Ongoing", mr: "सतत सुरू" }
  },
  {
    id: 133,
    icon: "🍎",
    category: { en: "Horticulture", mr: "फलोत्पादन" },
    name: { en: "National Horticulture Mission", mr: "राष्ट्रीय फलोत्पादन अभियान" },
    benefit: { en: "40% to 50% subsidy for orchards", mr: "फळबागांसाठी ४०% ते ५०% अनुदान" },
    eligibility: { en: "Farmers interested in fruit/veg", mr: "फळे/भाजीपाला लावण्यास इच्छुक शेतकरी" },
    desc: {
      en: "Promotes holistic growth of the horticulture sector including fruits, vegetables, and flowers.",
      mr: "फळे, भाजीपाला आणि फुलांच्या शेतीला प्रोत्साहन देण्यासाठी तांत्रिक आणि आर्थिक मदत."
    },
    docs: {
      en: ["7/12 Extract", "Caste Certificate", "Project Report"],
      mr: ["सातबारा उतारा", "जातीचा दाखला", "प्रकल्प अहवाल"]
    },
    link: "https://nhm.gov.in",
    color: "#e11d48",
    status: { en: "Active", mr: "सक्रिय" },
    trending: true
  }
];

const TX = {
  en: {
    title: "Govt Schemes",
    subtitle: "Explore welfare programs and financial aid tailored for you",
    tab_explore: "Explore",
    tab_applied: "My Applications",
    searchPlaceholder: "Search by name or category...",
    stats_total: "Available",
    stats_benefit: "Max Benefit",
    stats_active: "Active",
    category_all: "All Schemes",
    btn_details: "View Details",
    btn_hide: "Hide Details",
    btn_apply: "Apply Official →",
    btn_applied: "Portal Visited ↗",
    docs_title: "Documents Required:",
    eligibility_lbl: "Who is Eligible?",
    back_home: "Back to Home",
    no_results: "No schemes found.",
    no_applied: "You haven't applied to any schemes yet.",
    badge_popular: "🔥 Popular",
    applied_on: "Applied on:",
    visit_again: "Visit Link Again"
  },
  mr: {
    title: "सरकारी योजना",
    subtitle: "तुमच्यासाठी बनवलेल्या कल्याणकारी योजना आणि आर्थिक मदत शोधा",
    tab_explore: "योजना शोधा",
    tab_applied: "माझे अर्ज",
    searchPlaceholder: "नाव किंवा श्रेणीनुसार शोधा...",
    stats_total: "उपलब्ध",
    stats_benefit: "कमाल लाभ",
    stats_active: "सक्रिय",
    category_all: "सर्व योजना",
    btn_details: "तपशील पहा",
    btn_hide: "माहिती लपवा",
    btn_apply: "अधिकृत अर्ज →",
    btn_applied: "पोर्टलला भेट दिली ↗",
    docs_title: "आवश्यक कागदपत्रे:",
    eligibility_lbl: "पात्रता कोणासाठी?",
    back_home: "मुख्यपृष्ठावर जा",
    no_results: "कोणतीही योजना आढळली नाही.",
    no_applied: "तुम्ही अजून कोणत्याही योजनेसाठी अर्ज केलेला नाही.",
    badge_popular: "🔥 लोकप्रिय",
    applied_on: "अर्ज केल्याची तारीख:",
    visit_again: "पुन्हा लिंक पहा"
  }
};

const SchemesPage = ({ onNavigate, lang = "mr", setLang }) => {
  const [activeTab, setActiveTab] = useState("explore");
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [expanded, setExpanded] = useState(null);
  
  const [appliedHistory, setAppliedHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("agro_applied_history") || "[]");
  });

  const [allSchemes, setAllSchemes] = useState(SCHEMES);
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [statusRef, setStatusRef] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [news, setNews] = useState([]);
  const [redirectedIds, setRedirectedIds] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  
  useEffect(() => {
    const initData = async () => {
      // Fetch Schemes
      const list = await api.getSchemes();
      if (list && list.length > 0) setAllSchemes(list);
      else await api.seedSchemes(SCHEMES);

      // Fetch News
      const newsList = await api.getNews();
      if (newsList && newsList.length > 0) {
        setNews(newsList);
      } else {
        const seeded = await api.seedNews();
        if (seeded.success) {
          const freshNews = await api.getNews();
          setNews(freshNews);
        }
      }
    };
    initData();
  }, []);

  const t = TX[lang];

  useEffect(() => {
    localStorage.setItem("agro_applied_history", JSON.stringify(appliedHistory));
  }, [appliedHistory]);

  const catIcons = {
    "All": "🎯",
    "Direct Benefit": "💸",
    "Insurance": "🛡️",
    "Solar Energy": "☀️",
    "Soil Care": "🧪",
    "Maharashtra Special": "💎",
    "Machinery": "🚜",
    "Irrigation": "💧",
    "Horticulture": "🍇",
    "Credit": "💳",
    "Fisheries": "🐚",
    "Dairy": "🐄",
    "Vegetable": "🥦",
    "Housing": "🏠"
  };

  const categoriesData = [
    { en: "All", mr: "सर्व", icon: "🎯" },
    ...Array.from(new Set(allSchemes.map(s => s.category.en))).map(enName => {
      const found = allSchemes.find(s => s.category.en === enName);
      return { 
        ...found.category, 
        icon: catIcons[enName] || "📁" 
      };
    })
  ];

  const filtered = allSchemes.filter(s => {
    const matchesSearch = s.name[lang].toLowerCase().includes(search.toLowerCase()) || 
                          s.category[lang].toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "All" || s.category.en === activeCat;
    return matchesSearch && matchesCat;
  });

  const appliedList = allSchemes.filter(s => appliedHistory.some(h => h.id === s.id))
    .map(s => {
      const historyItem = appliedHistory.find(h => h.id === s.id);
      return { ...s, appliedDate: historyItem.date };
    });

  const handleApply = (id, link) => {
    setRedirectedIds([...redirectedIds, id]);
    window.open(link, "_blank");
  };

  const confirmApplication = async (id, name) => {
    if (!appliedHistory.some(h => h.id === id)) {
      const res = await api.applyForScheme({ 
        schemeId: id, 
        schemeName: name[lang], 
        user: "Citizen", 
        village: "Global" 
      });

      if (res.success) {
        const refId = res.refId;
        const newEntry = {
          id,
          date: new Date().toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          }),
          timestamp: Date.now(),
          notes: "",
          refId,
          status: "Pending"
        };
        setAppliedHistory([...appliedHistory, newEntry]);
        alert(lang === 'mr' ? `अर्ज पुष्टी केली! तुमचा Ref ID: ${refId}` : `Application Confirmed! Your Ref ID: ${refId}`);
        setRedirectedIds(redirectedIds.filter(rid => rid !== id));
      }
    }
  };

  const updateNote = (id, note) => {
    setAppliedHistory(appliedHistory.map(h => h.id === id ? { ...h, notes: note } : h));
  };

  const handleCheckStatus = async () => {
    if (!statusRef) return;
    const res = await api.checkSchemeStatus(statusRef);
    if (!res.error) {
      setStatusResult({
         id: res.refId,
         status: res.status,
         date: new Date(res.createdAt).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
         msg: res.status === 'Approved' ? (lang === 'mr' ? "तुमचा अर्ज मंजूर झाला आहे!" : "Your application has been approved!") : (lang === 'mr' ? "तुमचा अर्ज सध्या तपासणीत आहे." : "Your application is currently under review.")
      });
    } else {
      alert(lang === 'mr' ? "आयडी सापडला नाही!" : "ID Not Found!");
    }
  };

  return (
    <div className="sch-page">
      <div className="sch-bg-glow">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
      </div>

      <div className="sch-content">
        <div className="sch-gov-banner">
           <div className="sgb-left">
             <div className="sgb-stickers" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
               <span style={{fontSize: '2.2rem', filter: 'grayscale(0.3)'}}>🏛️</span>
               <span style={{fontSize: '2.2rem', color: '#ff4d4d'}}>🚩</span>
             </div>
             <div className="sgb-text">
               <b>{lang === 'mr' ? "महाराष्ट्र शासन" : "Govt of Maharashtra"}</b>
               <span>{lang === 'mr' ? "कृषी व सहकार विभाग" : "Dept of Agriculture & Cooperation"}</span>
             </div>
           </div>
           <div className="sgb-right">
             <div className="sgb-as-logo" style={{fontWeight: 900, color: '#1e40af', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700}}>{lang === 'mr' ? "अधिकृत पोर्टल" : "Official Portal"}</span>
                <span style={{borderLeft: '2px solid #cbd5e1', paddingLeft: '12px'}}>Aaple Sarkar</span>
             </div>
           </div>
        </div>

        <header className="sch-header">
          <div className="sch-header-left" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            <button className="sch-back-btn" onClick={() => onNavigate("home")}>
              <span>⬅️</span> {t.back_home}
            </button>
            <div className="sch-logo-group">
               <div className="sch-logo-text">🚜 {t.title}</div>
               <div className="sch-badge">ONLINE</div>
            </div>
          </div>
          <div className="sch-header-right">
            <button className="sch-status-btn" onClick={() => setShowStatusCheck(true)}>
              🔍 {lang === 'mr' ? "स्थिती तपासा" : "Check Status"}
            </button>
            <div className="sch-lang">
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
              <button className={lang === "mr" ? "on" : ""} onClick={() => setLang("mr")}>म</button>
            </div>
          </div>
        </header>

        <div className="sch-ticker">
          <div className="sch-ticker-label">{lang === 'mr' ? "ताज्या बातम्या:" : "Latest News:"}</div>
          <div className="sch-ticker-track">
            {news.length > 0 ? news.map((n, i) => (
              <span key={i}>📢 {n.title[lang]} • </span>
            )) : (
              <span>📢 Loading news...</span>
            )}
          </div>
        </div>

        <section className="sch-hero">
          <div className="sch-hero-bg-pattern"></div>
          <div className="sch-hero-content">
            <h1 className="sch-hero-h1">{t.title}</h1>
            <p className="sch-hero-sub-text">{t.subtitle}</p>
            
            <div className="sch-hero-stats">
              <div className="sh-stat-box">
                <div className="shs-icon">📂</div>
                <div className="shs-info">
                  <div className="shs-val">{allSchemes.length}</div>
                  <div className="shs-lbl">{t.stats_total}</div>
                </div>
              </div>
              <div className="sh-stat-box accent">
                <div className="shs-icon">💰</div>
                <div className="shs-info">
                  <div className="shs-val">₹9.5L+</div>
                  <div className="shs-lbl">{t.stats_benefit}</div>
                </div>
              </div>
              <div className="sh-stat-box">
                <div className="shs-icon">⚡</div>
                <div className="shs-info">
                  <div className="shs-val">24/7</div>
                  <div className="shs-lbl">{t.stats_active}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sch-main-layout">
          {/* ── LEFT SIDEBAR (BANNERS) ── */}
          <aside className="sch-sidebar-left">
            <div className="sch-side-banner help-banner">
              <h3>{lang === 'mr' ? "मदत हवी आहे?" : "Need Help?"}</h3>
              <p>{lang === 'mr' ? "योजनेसाठी अर्ज करताना अडचण येत असल्यास आमच्याशी संपर्क साधा." : "Facing issues while applying? Contact our support team."}</p>
              <button className="sch-side-btn">📞 1800-123-456</button>
            </div>

            <div className="sch-side-card">
              <h4>{lang === 'mr' ? "महत्वाचे दुवे" : "Important Links"}</h4>
              <ul className="sch-side-links">
                <li><a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noreferrer">MahaDBT Portal ↗</a></li>
                <li><a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer">PM Kisan Portal ↗</a></li>
                <li><a href="https://krishi.maharashtra.gov.in" target="_blank" rel="noreferrer">Krishi Vibhag ↗</a></li>
              </ul>
            </div>

            <div className="sch-side-banner promo-banner">
              <div className="sp-icon">📱</div>
              <h4>{lang === 'mr' ? "आमचे ॲप वापरा" : "Use Our App"}</h4>
              <p>{lang === 'mr' ? "सर्व अपडेट्स मोबाईलवर मिळवण्यासाठी ॲप डाऊनलोड करा." : "Download app to get all updates on your mobile."}</p>
            </div>
          </aside>

          {/* ── CENTER CONTENT ── */}
          <main className="sch-center-content">
            <div className="sch-controls">
              <div className="sch-search-wrap">
                <span className="sch-search-icon">🔍</span>
                <input 
                  type="text" 
                  className="sch-search" 
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="sch-cats">
                {categoriesData.map(c => (
                  <button 
                    key={c.en} 
                    className={`sch-cat ${activeCat === c.en ? "on" : ""}`}
                    onClick={() => setActiveCat(c.en)}
                  >
                    {c.icon} {c[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sch-tabs">
              <button className={activeTab === "explore" ? "on" : ""} onClick={() => setActiveTab("explore")}>
                {t.tab_explore}
              </button>
              <button className={activeTab === "applied" ? "on" : ""} onClick={() => setActiveTab("applied")}>
                {t.tab_applied} ({appliedHistory.length})
              </button>
            </div>

            {activeTab === "explore" ? (
              <div className="sch-grid">
                {filtered.length > 0 ? filtered.map(s => {
                  const schemeId = s.id || s._id;
                  const isApplied = appliedHistory.some(h => (h.id || h._id) === schemeId);
                  const isRedirected = redirectedIds.includes(schemeId);
                  const isExpanded = expanded === schemeId;

                  return (
                    <div key={schemeId} className={`sch-card ${isApplied ? "applied" : ""}`}>
                      {s.trending && <div className="sch-card-badge-trending">🔥 Trending</div>}
                      <div className="sch-card-top">
                        <div className="sch-card-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                        <div className="sch-card-cat">{s.category[lang]}</div>
                      </div>
                      <h3 className="sch-card-name">{s.name[lang]}</h3>
                      
                      <div className="sch-card-benefit">
                        <div className="sch-card-benefit-lbl">{lang === 'mr' ? "मिळणारा लाभ:" : "Benefit:"}</div>
                        <div className="sch-card-benefit-val" style={{ color: s.color }}>{s.benefit[lang]}</div>
                      </div>

                      <div className="sch-card-footer">
                        <button className="sch-card-btn details" onClick={() => setExpanded(isExpanded ? null : schemeId)}>
                          {isExpanded ? t.btn_hide : t.btn_details}
                        </button>
                        
                        <button 
                          className="sch-card-btn apply"
                          style={{
                            background: isApplied ? 'rgba(16, 185, 129, 0.15)' : (isRedirected ? '#1e40af' : '#fff'),
                            color: isApplied ? '#34d399' : (isRedirected ? '#fff' : '#000'),
                            border: isApplied ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!s.link) return alert(lang === 'mr' ? "लिंक उपलब्ध नाही" : "Link not available");
                            if (isRedirected && !isApplied) {
                              confirmApplication(schemeId, s.name);
                            } else {
                              handleApply(schemeId, s.link);
                            }
                          }}
                        >
                          {isApplied ? (
                            <>✅ {t.btn_applied}</>
                          ) : isRedirected ? (
                            <>📩 {lang === 'mr' ? "अर्ज पूर्ण झाला?" : "Done Applying?"}</>
                          ) : (
                            <>{t.btn_apply}</>
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="sch-card-expanded">
                           <div className="sce-section">
                             <h4>📋 {t.eligibility_lbl}</h4>
                             <p>{s.eligibility[lang]}</p>
                           </div>
                           <div className="sce-section">
                             <h4>ℹ️ {lang === 'mr' ? "योजनेबद्दल:" : "About:"}</h4>
                             <p>{s.desc[lang]}</p>
                           </div>
                           <div className="sce-section">
                             <h4>📄 {t.docs_title}</h4>
                             <ul>
                               {s.docs[lang].map((d, i) => <li key={i}>{d}</li>)}
                             </ul>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="sch-no-results">
                    <div className="snr-icon">🔍</div>
                    <p>{t.no_results}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="sch-applied-list">
                {appliedList.length > 0 ? appliedList.map(s => {
                  const hist = appliedHistory.find(h => h.id === s.id);
                  return (
                    <div key={s.id} className="sch-applied-card">
                       <div className="sac-icon">{s.icon}</div>
                       <div className="sac-info">
                         <h3>{s.icon} {s.name[lang]}</h3>
                         <div className="sac-meta">
                            <span>📅 {t.applied_on} {s.appliedDate || "N/A"}</span>
                            <span>🆔 Ref: {hist.refId || "N/A"}</span>
                            <div style={{marginTop: '8px'}}>
                              <span className={`status-pill ${(hist.status || "Pending").toLowerCase()}`}>
                                {hist.status || "Pending"}
                              </span>
                            </div>
                         </div>
                       </div>
                       <button className="sac-btn" onClick={() => window.open(s.link, "_blank")}>
                         {t.visit_again}
                       </button>
                    </div>
                  );
                }) : (
                  <div className="sch-no-results">
                    <div className="snr-icon">📄</div>
                    <p>{t.no_applied}</p>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* ── RIGHT SIDEBAR (TIPS) ── */}
          <aside className="sch-sidebar-right">
             <div className="sch-side-card tips-card">
               <h4>💡 {lang === 'mr' ? "महत्वाच्या टिप्स" : "Quick Tips"}</h4>
               <ul className="sch-tips-list">
                 <li>{lang === 'mr' ? "आधार कार्ड बँकेशी लिंक असल्याची खात्री करा." : "Ensure your Aadhar is linked with your bank account."}</li>
                 <li>{lang === 'mr' ? "सर्व कागदपत्रे स्कॅन करून तयार ठेवा." : "Keep all documents scanned and ready."}</li>
                 <li>{lang === 'mr' ? "योजनेच्या अटी व शर्ती नीट वाचा." : "Read terms and conditions carefully."}</li>
                 <li>{lang === 'mr' ? "अर्जाची स्थिती नियमितपणे तपासा." : "Check application status regularly."}</li>
               </ul>
             </div>

             <div className="sch-side-banner stat-banner">
                <div className="sb-val">₹१,२०० कोटी</div>
                <div className="sb-lbl">{lang === 'mr' ? "राज्याचे कृषी बजेट" : "State Agri Budget"}</div>
             </div>
          </aside>
        </div>

        <footer className="sch-footer">
          <div className="sch-footer-grid">
            <div className="sf-brand">
               <div className="sf-logo">🏛️ {t.title}</div>
               <p>{lang === 'mr' ? "महाराष्ट्र कृषी कल्याण वेब पोर्टल" : "Maharashtra Agri Welfare Portal"}</p>
            </div>
            <div className="sf-links">
              <button onClick={() => onNavigate("home")}>{t.back_home}</button>
              <button>{lang === 'mr' ? "संपर्क" : "Contact"}</button>
              <button>{lang === 'mr' ? "गोपनीयता" : "Privacy"}</button>
            </div>
          </div>
          <div className="sf-bottom">
             <p>© 2026 <span>AgroCalculus</span>. {lang === 'mr' ? "सर्व हक्क राखीव." : "All rights reserved."}</p>
          </div>
        </footer>
        <AdBanner position="schemes-bottom" />
      </div>

      {showStatusCheck && (
        <div className="sch-modal-overlay" onClick={() => setShowStatusCheck(false)}>
          <div className="sch-modal" onClick={e => e.stopPropagation()}>
            <button className="sch-modal-close" onClick={() => setShowStatusCheck(false)}>×</button>
            <h3>🔍 {lang === 'mr' ? "अर्जाची स्थिती तपासा" : "Check Application Status"}</h3>
            <p>{lang === 'mr' ? "तुमचा अर्ज आयडी (Ref ID) टाका:" : "Enter your Application ID (Ref ID):"}</p>
            <div className="sch-status-input">
              <input type="text" placeholder="e.g. MH2026998811" value={statusRef} onChange={(e) => setStatusRef(e.target.value)} />
              <button onClick={handleCheckStatus}>{lang === 'mr' ? "तपासा" : "Check"}</button>
            </div>
            {statusResult && (
              <div className="sch-status-card slide-in">
                <div className="ssc-header">
                  <span className="ssc-id">#{statusResult.id}</span>
                  <span className={`ssc-badge ${(statusResult.status || "Pending").toLowerCase().replace(' ', '-')}`}>{statusResult.status || "Pending"}</span>
                </div>
                <p className="ssc-msg">{statusResult.msg}</p>
                <div className="ssc-footer">📅 {statusResult.date || "N/A"}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemesPage;
