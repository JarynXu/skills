> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/commonsecuritybestpractices.polish.md`  
> Upstream Git blob: `1638ec8ae269b30177c85f9d883fd5391ee3bbaf`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[✔]: ../../assets/images/checkbox-small-blue.png

# Typowe najlepsze praktyki bezpieczeństwa Node.js

Sekcja wspólnych wskazówek bezpieczeństwa zawiera najlepsze praktyki, które są znormalizowane w wielu ramach i konwencjach, na przykład uruchamianie aplikacji za pomocą protokołu SSL / TLS powinno być wspólną wytyczną i konwencją przestrzeganą w każdej konfiguracji, aby osiągnąć ogromne korzyści bezpieczeństwa.

## ![✔] Użyj SSL / TLS, aby zaszyfrować połączenie klient-serwer

**TL;DR:** W czasach [darmowych certyfikatów SSL/TLS](https://letsencrypt.org/) i ich łatwej konfiguracji, nie musisz już rozważać zalet i wad korzystania z bezpiecznego serwera, ponieważ zalety takie jak bezpieczeństwo, obsługa nowoczesnej technologii i zaufanie wyraźnie przewyższają wady takie jak minimalny narzut w porównaniu do czystego HTTP.

**W przeciwnym razie:** Atakujący mogą przeprowadzać ataki typu man-in-the-middle, szpiegować zachowanie użytkowników i wykonywać jeszcze bardziej złośliwe działania, gdy połączenie nie jest szyfrowane

🔗 [**Czytaj więcej: Running a secure Node.js server**](./secureserver.md)

<br/><br/>

## ![✔] Bezpieczne porównywanie wartości poufnych i skrótów

**TL;DR:** Porównując tajne wartości lub skróty, takie jak skróty HMAC, powinieneś użyć [`crypto.timingSafeEqual(a,b)`]](https://nodejs.org/dist/latest-v9.x/docs/api/crypto.html#crypto_crypto_timingsafeequal_a_b) funkcja Node'a udostępnia od razu po instalacji od wersji Node.js v6.6.0. Ta metoda porównuje dwa podane obiekty i porównuje, nawet jeśli dane się nie zgadzają. Domyślne metody porównywania równości powróciłyby po niedopasowaniu znaków, umożliwiając ataki czasowe na podstawie długości operacji.

**W przeciwnym razie:** Używając domyślnych operatorów porównania równości, możesz ujawnić krytyczne informacje na podstawie czasu potrzebnego na porównanie dwóch obiektów

<br/><br/>

## ![✔] Generowanie losowych ciągów za pomocą Node.js

**TL;DR:** Korzystanie z niestandardowej funkcji generującej pseudolosowe ciągi znaków dla tokenów i innych wrażliwych na bezpieczeństwo przypadków użycia może nie być tak losowe, jak myślisz, co może narazić Twoją aplikację na ataki kryptograficzne. Gdy musisz wygenerować bezpieczne losowe ciągi, użyj [`crypto.randomBytes(size,[callback])`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) przy użyciu dostępnej entropii dostarczonej przez system.

**W przeciwnym razie:** Podczas generowania pseudolosowych ciągów bez metod kryptograficznych osoby atakujące mogą przewidywać i odtwarzać wygenerowane wyniki, co powoduje, że aplikacja nie jest bezpieczna

<br/><br/>

Dalej, poniżej wymieniliśmy kilka ważnych porad z projektu OWASP.

## ![✔] OWASP A2: Broken Authentication

- Wymagaj MFA / 2FA dla ważnych usług i kont
- Często zmieniaj hasła i klucze dostępu, w tym klucze SSH
- Zastosuj silne zasady haseł, zarówno w przypadku operacji, jak i zarządzania użytkownikami w aplikacji ([🔗 OWASP password recommendation](https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Implement_Proper_Password_Strength_Controls.22))
- Nie wysyłaj ani nie wdrażaj aplikacji z domyślnymi poświadczeniami, szczególnie dla użytkowników administracyjnych lub usług zewnętrznych, od których zależysz
- Używaj tylko standardowych metod uwierzytelniania, takich jak OAuth, OpenID itp. - **Unikaj** Podstawowego uwierzytelnienia
- Ograniczanie szybkości uwierzytelniania: nie zezwalaj na więcej niż _X_ prób logowania (w tym odzyskiwania hasła itp.) w okresie _Y_
- W przypadku niepowodzenia logowania nie informuj użytkownika, czy weryfikacja nazwy użytkownika lub hasła nie powiodła się, po prostu zwróć typowy błąd uwierzytelnienia
- Rozważ zastosowanie scentralizowanego systemu zarządzania użytkownikami, aby uniknąć zarządzania wieloma kontami na pracownika (np. GitHub, AWS, Jenkins itp.) i skorzystaj z przetestowanego w walce systemu zarządzania użytkownikami

## ![✔] OWASP A5:  Broken access control

- Przestrzegaj [zasady najmniejszych przywilejów](https://en.wikipedia.org/wiki/Principle_of_least_privilege)  -  każdy komponent i osoba DevOps powinna mieć dostęp tylko do niezbędnych informacji i zasobów
- **Nigdy** nie pracuj z console/root (pełne uprawnienia) z wyjątkiem zarządzania kontem
- Uruchom wszystkie instancje / kontenery w imieniu konta roli / usługi
- Przypisywanie uprawnień grupom, a nie użytkownikom. Powinno to uczynić zarządzanie uprawnieniami łatwiejszymi i bardziej przejrzystymi w większości przypadków

## ![✔] OWASP A6: Security Misconfiguration

- Dostęp do wewnętrznych elementów środowiska produkcyjnego odbywa się tylko przez sieć wewnętrzną, użyj SSH lub w inny sposób, ale _nigdy_ nie ujawnij usługi wewnętrznej
- Ogranicz dostęp do sieci wewnętrznej - jawnie określ, który zasób może uzyskać dostęp do innych zasobów (np. zasad sieciowych lub podsieci)
- Jeśli używasz plików cookie, skonfiguruj go w tryb „bezpieczny”, w którym jest wysyłany tylko przez SSL
- Jeśli używasz plików cookie, skonfiguruj je tylko dla „tej samej strony”, aby tylko żądania z tej samej domeny odzyskały wyznaczone pliki cookie
- W przypadku korzystania z plików cookie preferuj konfigurację „HttpOnly”, która uniemożliwia dostęp do plików cookie przez kod JavaScript po stronie klienta
- Chroń każdego VPC za pomocą ścisłych i restrykcyjnych zasad dostępu
- Priorytetyzuj zagrożenia za pomocą dowolnego standardowego modelowania zagrożeń bezpieczeństwa, takiego jak STRIDE lub DREAD
- Ochrona przed atakami DDoS za pomocą równoważników obciążenia HTTP (S) i TCP
- Przeprowadzaj okresowe testy penetracyjne przez wyspecjalizowane agencje

## ![✔] OWASP A3: Sensitive Data Exposure

- Akceptuj tylko połączenia SSL / TLS, wymuszaj ścisłe bezpieczeństwo transportu za pomocą nagłówków
- Podziel sieć na segmenty (tj. podsieci) i upewnij się, że każdy węzeł ma najmniej niezbędne uprawnienia dostępu do sieci
- Zgrupuj wszystkie usługi / wystąpienia, które nie wymagają dostępu do Internetu, i wyraźnie nie zezwalaj na żadne połączenie wychodzące (np. prywatna podsieć)
- Przechowuj wszystkie dane wrażliwe w produktach Vault, takich jak AWS KMS, HashiCorp Vault lub Google Cloud KMS
- Metadane instancji wrażliwej na blokadę przy użyciu metadanych
- Szyfruj przesyłane dane, gdy opuszczą fizyczną granicę
- Nie dołączaj danych wrażliwych do instrukcji dziennika
- Unikaj wyświetlania prostych haseł w interfejsie użytkownika, podejmuj niezbędne środki w interfejsie i nigdy nie przechowuj poufnych informacji w postaci zwykłego tekstu

## ![✔] OWASP A9: Using Components With Known Security Vulneraibilities

- Skanuj obrazy dokerów w poszukiwaniu znanych luk (przy użyciu Dockera i innych dostawców oferują usługi skanowania)
- Włącz automatyczne łatanie i aktualizowanie instancji (maszyny), aby uniknąć uruchamiania starych wersji systemu operacyjnego, które nie zawierają poprawek zabezpieczeń
- Zapewnij użytkownikowi zarówno token „id”, „access”, jak i „refresh”, aby token dostępu był krótkotrwały i odnowiony tokenem odświeżania
- Rejestruj i kontroluj każde wywołanie interfejsu API do usług w chmurze i usług zarządzania (np. Kto usunął segment S3?) Za pomocą usług takich jak AWS CloudTrail
- Uruchom narzędzie do sprawdzania bezpieczeństwa dostawcy usług w chmurze (np. doradca ds. zaufania bezpieczeństwa AWS)

## ![✔] OWASP A10: Insufficient Logging & Monitoring

- Ostrzegaj o niezwykłych lub podejrzanych zdarzeniach kontrolnych, takich jak logowanie użytkownika, tworzenie nowego użytkownika, zmiana uprawnień itp
- Alarm o nieregularnej liczbie błędów logowania (lub równoważnych działań, takich jak zapomnienie hasła)
- Dołącz czas i nazwę użytkownika, które zainicjowały aktualizację do każdego rekordu BD

## ![✔] OWASP A7: Cross-Site-Scripting (XSS)

- Używaj szablonów lub struktur szablonów, które automatycznie uciekają z XSS zgodnie z projektem, takich jak EJS, Pug, React lub Angular. Poznaj ograniczenia każdego mechanizmu ochrony XSS i odpowiednio obsługuj przypadki użycia, które nie są objęte
- Ucieczka niezaufanych danych żądań HTTP na podstawie kontekstu w danych wyjściowych HTML (treść, atrybut, JavaScript, CSS lub adres URL) usunie podatność na Reflected i Stored XSS
- Zastosowanie kodowania kontekstowego podczas modyfikowania dokumentu przeglądarki po stronie klienta działa przeciwko DOM XSS
- Włączenie polityki bezpieczeństwa treści (CSP) jako dogłębnej obrony ograniczającej kontrolę nad XSS

<br/><br/><br/>
