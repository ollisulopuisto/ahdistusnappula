# Ahdistusnappula

Ahdistusnappula on käyttäjän tiedot yksityisenä pitävä pikkuohjelma, jolla voi kirjata muistiin ahdistuksen tunteita.

Sovellus tallentaa kaikki tiedot käyttäjän omaan selaimeen (esim. älypuhelimen selain). Se ei kerro _kenellekään muulle_, mitä käyttäjä on sovellukseen kirjannut.

## Toiminta

Sovellus koostuu kolmesta päänäkymästä:

1.  **Nappulat:** Tässä näkymässä näet listan painikkeita, jotka edustavat yleisiä ahdistuksen aiheita (esim. "KOULU AHDISTAA", "VANHEMMAT AHDISTAA"). Voit painaa nappia, joka vastaa sen hetkistä ahdistuksen syytäsi. Painallus tallennetaan aikaleiman kanssa.
    *   **MUU SYY AHDISTAA:** Tämän napin avulla voit kirjata ahdistuksen syyn, jolle ei ole omaa nappia. Sovellus kysyy tarkempaa syytä ja voi luoda siitä uuden napin tulevaa käyttöä varten.
    *   **Kissa-emoji:** Useimmin painetun napin päällä näkyy kissa-emoji 🐱.
2.  **Tilastot:** Tässä näkymässä voit visualisoida kerättyä dataa.
    *   **Aikajana:** Näyttää painallusten määrän ajan funktiona, ryhmiteltynä päivän mukaan.
    *   **Tyypeittäin:** Näyttää ympyrädiagrammin (tai vastaavan) painallusten jakautumisesta eri ahdistuksen syiden kesken.
    *   **Suodatus:** Voit suodattaa tilastoja eri aikaväleille (viimeiset 7 päivää, viimeiset 30 päivää, kaikki).
3.  **Asetukset:** Tässä näkymässä voit:
    *   **Muokata nappeja:** Muuttaa olemassa olevien nappien tekstejä tai poistaa nappeja.
    *   **Lisätä uusia nappeja:** Luoda omia ahdistusnappeja.
    *   **Vaihtaa nimeä:** Muuttaa sovelluksen tervehdyksessä käytettävää nimeä.

## Käyttöohjeet

1.  **Avaa sovellus:** Siirry sovelluksen osoitteeseen selaimellasi: <https://ollisulopuisto.github.io/ahdistusnappula/>
2.  **Nimen asetus:** Ensimmäisellä käyttökerralla sovellus kysyy nimeäsi tervehdystä varten. Voit muuttaa nimen myöhemmin Asetukset-näkymässä.
3.  **Ahdistuksen kirjaaminen:**
    *   Siirry "Nappulat"-näkymään (oletusnäkymä).
    *   Paina sitä nappia, joka kuvaa parhaiten ahdistuksesi syytä.
    *   Jos syy on muu, paina "MUU SYY AHDISTAA" ja kirjoita syy avautuvaan ikkunaan.
4.  **Tilastojen tarkastelu:**
    *   Siirry "Tilastot"-näkymään yläpalkin navigoinnista.
    *   Valitse haluamasi aikaväli ja näkymätyyppi (Aikajana / Tyypeittäin).
    *   Tarkastele graafia.
5.  **Asetusten muokkaaminen:**
    *   Siirry "Asetukset"-näkymään.
    *   Muokkaa, poista tai lisää nappeja tarpeen mukaan.
    *   Vaihda käyttäjänimeäsi "Vaihda käyttäjänimi" -napista.

## Tietojen tallennus

Kaikki painallustiedot, nappien asetukset ja käyttäjänimi tallennetaan **ainoastaan paikallisesti selaimesi Local Storageen**. Tietoja ei lähetetä palvelimelle, ja ne ovat käytettävissä vain sillä laitteella ja selaimella, jolla niitä käytät. Selaimen välimuistin tai paikallisen tallennustilan tyhjentäminen poistaa kaikki tallennetut tiedot.

---
Ahdistusnappula &copy; 2025