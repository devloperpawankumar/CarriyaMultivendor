// Centralized location data for provinces, cities, and areas

export type LocationMap = Record<string, Record<string, string[]>>;

export const locations: LocationMap = {
  Sindh: {
    Karachi: [
      "Karachi East",
      "Karachi West",
      "Karachi South",
      "Karachi Central",
      "Korangi",
      "Malir",
      "Keamari"
    ],
    Hyderabad: ["Latifabad", "Qasimabad", "Hyderabad City"],
    Sukkur: ["Sukkur City", "Rohri", "New Sukkur"],
    Larkana: ["Larkana City", "Dokri", "Ratodero"],
    Khairpur: ["Khairpur City", "Kot Diji", "Nara"],
    Tharparkar: ["Mithi", "Islamkot", "Chachro"],
    Thatta: ["Thatta City", "Mirpur Sakro", "Keti Bunder"],
    Umerkot: ["Umerkot City", "Kunri", "Pithoro"]
  },
  Punjab: {
    Lahore: [
      "Lahore City",
      "Model Town",
      "Cantt",
      "Gulberg",
      "Shalimar",
      "Iqbal Town",
      "Samanabad"
    ],
    Rawalpindi: ["Rawalpindi City", "Gujar Khan", "Murree", "Taxila"],
    Faisalabad: ["Faisalabad City", "Jaranwala", "Samanabad", "Tandlianwala"],
    Multan: ["Multan City", "Shujabad", "Lal Pur"],
    Gujranwala: ["Gujranwala City", "Wazirabad", "Kamoke"],
    Sialkot: ["Sialkot City", "Daska", "Sambrial"],
    Bahawalpur: ["Bahawalpur City", "Lodhran", "Hasilpur"]
  },
  KhyberPakhtunkhwa: {
    Peshawar: ["Peshawar City", "Hayatabad", "Badhaber", "Mathra"],
    Abbottabad: ["Abbottabad City", "Lora", "Nathia Gali"],
    Swat: ["Mingora", "Khwazakhela", "Barikot"],
    Mardan: ["Mardan City", "Takht Bhai", "Katlang"],
    Bannu: ["Bannu City", "Domel"],
    Kohat: ["Kohat City", "Lachi", "Nowkar"],
    Haripur: ["Haripur City", "Ghazi", "Karakorum Road"]
  },
  Balochistan: {
    Quetta: ["Quetta City", "Sariab Road", "Airport"],
    Gwadar: ["Gwadar City", "Pasni"],
    Chagai: ["Nokundi", "Dalbandin"],
    Lasbela: ["Hub", "Uthal", "Bela"],
    Kech: ["Turbat", "Dasht"],
    Zhob: ["Zhob City", "Killa Saifullah"],
    Pishin: ["Pishin City", "Huramzai"]
  }
};

export default locations;


