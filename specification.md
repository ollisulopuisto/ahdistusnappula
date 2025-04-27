# Ahdistusnappula-sovelluksen määrittely

## 1. Tavoite

Tämän sovelluksen tavoitteena on tarjota nuorelle helppo tapa kirjata ylös ahdistuksen tunteita ja niiden syitä. Sovellus visualisoi kerättyä dataa, auttaen käyttäjää hahmottamaan ahdistuksen esiintymistiheyttä ja mahdollisia kaavoja.

## 2. Kohdekäyttäjä

Sovellus on suunnattu ensisijaisesti teini-ikäisille ja nuorille aikuisille, jotka kokevat ahdistusta ja haluavat yksinkertaisen työkalun sen seuraamiseen.

## 3. Toiminnallisuus

Sovellus koostuu kahdesta päänäkymästä: "Ahdistusnappi" ja "Tilastot".

### 3.1. Ahdistusnappi -näkymä

*   **Ulkoasu:** Näkymässä on selkeästi ja isolla esillä useita punaisia painikkeita.
*   **Painikkeet:** Jokaisessa painikkeessa lukee jokin ahdistuksen aihe:
    *   KOULU AHDISTAA
    *   VANHEMMAT AHDISTAA
    *   KAVERIT AHDISTAA
    *   AIKATAULUT AHDISTAA
    *   SIIVOAMINEN AHDISTAA
    *   (Mahdollisesti muita tai "MUU SYY AHDISTAA" -nappi)
*   **Toiminta:** Kun käyttäjä painaa jotakin painiketta:
    *   Sovellus tallentaa painalluksen tiedot: painikkeen tyyppi (esim. "KOULU") ja tarkka aikaleima (päivämäärä ja kellonaika).
    *   Sovellus voi antaa käyttäjälle pienen visuaalisen tai tuntopalautteen onnistuneesta kirjauksesta (esim. napin lyhyt välähdys tai värinä mobiililaitteella).

### 3.2. Tilastot -näkymä

*   **Tarkoitus:** Näyttää visualisoituna, kuinka usein kutakin ahdistusnappia on painettu.
*   **Visualisointi:**
    *   Näkymässä on graafi (esim. pylväsdiagrammi tai aikajanakuvaaja).
    *   Graafi näyttää ahdistuspainallusten määrän ajan funktiona. Data voidaan ryhmitellä esimerkiksi päivittäin, viikoittain tai ahdistuksen syyn mukaan.
    *   Käyttäjä voi mahdollisesti suodattaa näkymää eri aikaväleille (esim. viimeinen viikko, viimeinen kuukausi).
*   **Datan haku:** Näkymä hakee tallennetut painallustiedot ja muodostaa niistä graafin.

### 3.3. Datan Tallennus

*   **Tallennettavat tiedot:**
    *   Ahdistuksen tyyppi (mikä nappi)
    *   Aikaleima (milloin painettu)
*   **Tallennusmekanismi:**
    *   **Vaihtoehto 1 (Yksinkertainen):** Selaimen paikallinen tallennustila (Local Storage). Tämä on helppo toteuttaa, mutta data on vain kyseisellä laitteella ja selaimella.
    *   **Vaihtoehto 2 (Laajennettava):** Taustajärjestelmä (backend) ja tietokanta. Tämä mahdollistaa datan säilymisen ja käytön useammalla laitteella, mutta vaatii enemmän kehitystyötä. **Aloitetaan paikallisella tallennustilalla.**

### 3.4. Navigaatio

*   Käyttäjän on helppo siirtyä "Ahdistusnappi" ja "Tilastot" -näkymien välillä, esimerkiksi yläpalkin linkkien tai välilehtien avulla.

## 4. Teknologia (Ehdotus)

*   **Frontend:** HTML, CSS, JavaScript.
    *   CSS: Varmistetaan suurien, selkeiden nappien ja responsiivisen ulkoasun toteutus (toimii eri näyttökooilla, myös mobiilissa).
    *   JavaScript: Hoitaa napin painallusten logiikan, datan tallennuksen (Local Storage) ja graafin piirtämisen Tilastot-näkymässä.
*   **Graafikirjasto (Ehdotus):** Chart.js, Plotly.js tai muu vastaava kevyt JavaScript-kirjasto graafien luomiseen.

## 5. Käyttöliittymä (UI) / Käyttökokemus (UX)

*   **Yksinkertaisuus:** Sovelluksen tulee olla erittäin helppokäyttöinen.
*   **Selkeys:** Isot painikkeet, selkeä teksti.
*   **Visuaalisuus:** Punaiset napit korostavat tunnetilaa. Graafin tulee olla helposti tulkittava.
*   **Responsiivisuus:** Toimii hyvin sekä tietokoneen selaimessa että mobiililaitteilla (mobiiliystävällinen nettisivu).
