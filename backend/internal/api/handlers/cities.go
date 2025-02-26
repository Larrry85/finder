package handlers

import (
	"encoding/json"
	"net/http"
)

var finnishLocations = []string{
	"Akaa", "Alavus", "Enontekiö", "Espoo", "Eura",
	"Forssa", "Haapajärvi", "Haapavesi", "Hamina", "Harjavalta",
	"Heinävesi", "Helsinki", "Hollola", "Huittinen", "Hyvinkää",
	"Hämeenlinna", "Hyrynsalmi", "Iisalmi", "Iitti", "Ilomantsi",
	"Imatra", "Inari", "Isojoki", "Joensuu", "Juankoski",
	"Juuka", "Jyväskylä", "Jämsä", "Kaarina", "Kaavi",
	"Kajaani", "Kankaanpää", "Kannonkoski", "Karstula", "Karttula",
	"Kauhajoki", "Kauniainen", "Keitele", "Kemi", "Kemijärvi",
	"Keminmaa", "Kerava", "Keuruu", "Kinnula", "Kirkkonummi",
	"Kitee", "Kittilä", "Kiuruvesi", "Kivijärvi", "Kokkola",
	"Kolari", "Kontiolahti", "Kotka", "Kouvola", "Kristiinankaupunki",
	"Kuhmoinen", "Kuopio", "Kurikka", "Kuusamo", "Kyyjärvi",
	"Kylmäkoski", "Kärsämäki", "Lahti", "Lapinlahti", "Lappeenranta",
	"Lemi", "Leppävirta", "Lieksa", "Lieto", "Liminka",
	"Liperi", "Lohja", "Lumijoki", "Luoto", "Luumäki",
	"Maalahti", "Miehikkälä", "Mikkeli", "Muonio", "Muurame",
	"Muuruvesi", "Mänttä-Vilppula", "Naantali", "Nivala", "Nurmes",
	"Nurmijärvi", "Närpiö", "Orimattila", "Orivesi", "Oulu",
	"Oulunsalo", "Outokumpu", "Paltamo", "Parainen", "Parikkala",
	"Pedersöre", "Pello", "Pelkosenniemi", "Petäjävesi", "Pietarsaari",
	"Pielavesi", "Pieksämäki", "Polvijärvi", "Pori", "Porvoo",
	"Posio", "Pudasjärvi", "Puolanka", "Pyhtää", "Pyhäjoki",
	"Pyhäjärvi", "Pöytyä", "Raahe", "Raisio", "Ranua",
	"Rautalampi", "Rauma", "Rautavaara", "Rautjärvi", "Reisjärvi",
	"Ristijärvi", "Rovaniemi", "Ruokolahti", "Ruovesi", "Rääkkylä",
	"Saarijärvi", "Salla", "Salo", "Savitaipale", "Savonlinna",
	"Savukoski", "Seinäjoki", "Siikajoki", "Siilinjärvi", "Sipoo",
	"Sodankylä", "Sonkajärvi", "Sotkamo", "Suomussalmi", "Taipalsaari",
	"Tampere", "Tervo", "Tervola", "Tohmajärvi", "Toijala",
	"Tornio", "Turku", "Tuusniemi", "Tuusula", "Tyrnävä",
	"Ulvila", "Uurainen", "Uusikaupunki", "Vaala", "Vaasa",
	"Valkeakoski", "Valtimo", "Vantaa", "Varkaus", "Vesanto",
	"Vieremä", "Vihti", "Viinikkala", "Viitasaari", "Virrat",
	"Virolahti", "Ylitornio", "Ylivieska", "Ähtäri", "Äänekoski",
}

func GetCities(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")
	json.NewEncoder(w).Encode(finnishLocations)
}
