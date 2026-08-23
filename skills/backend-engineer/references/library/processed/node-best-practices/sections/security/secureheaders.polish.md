> **Offline teaching derivative**  
> Source: `goldbergyoni/nodebestpractices@dc3d60c29d5483d9ea99cf261bbd6203516a2ba7`  
> Upstream path: `sections/security/secureheaders.polish.md`  
> Upstream Git blob: `247d4a8c7d08e08104c018cbf5053934780aa66f`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Korzystanie z nagłówków związanych z bezpieczeństwem w celu zabezpieczenia aplikacji przed typowymi atakami

<br/><br/>


### Wyjaśnienie jednym akapitem

Istnieją nagłówki związane z bezpieczeństwem, które służą do dalszego zabezpieczenia aplikacji. Najważniejsze nagłówki są wymienione poniżej. Możesz również odwiedzić witryny połączone na dole tej strony, aby uzyskać więcej informacji na ten temat. Możesz łatwo ustawić te nagłówki za pomocą modułu [Helmet](https://www.npmjs.com/package/helmet) modułu dla express ([Helmet for koa](https://www.npmjs.com/package/koa-helmet)).

<br/><br/>

### Spis treści
- [HTTP Strict Transport Security (HSTS)](#http-strict-transport-security-hsts)
- [Public Key Pinning dla HTTP (HPKP)](#public-key-pinning-dla-http-hpkp)
- [X-Frame-Options](#x-frame-options)
- [X-XSS-Protection](#x-xss-protection)
- [X-Content-Type-Options](#x-content-type-options)
- [Referrer-Policy](#referrer-policy)
- [Expect-CT](#expect-ct)
- [Content-Security-Policy](#content-security-policy)
- [Additional Resource](#dodatkowe-zasoby)

<br/><br/>

### HTTP Strict Transport Security (HSTS)

HTTP Strict Transport Security (HSTS) to mechanizm polityki bezpieczeństwa sieci, który chroni strony internetowe przed [protocol downgrade attacks](https://en.wikipedia.org/wiki/Downgrade_attack) oraz [cookie hijacking](https://www.owasp.org/index.php/Session_hijacking_attack). Pozwala serwerom internetowym zadeklarować, że przeglądarki internetowe (lub inne zgodne z nimi aplikacje klienckie) powinny z nim współpracować tylko przy użyciu __secure HTTPS connections__, oraz __never__ przez niepewny protokół HTTP. Polityka HSTS jest implementowana przy użyciu nagłówka `Strict-Transport-Security` przez istniejące połączenie HTTPS.

Nagłówek Strict-Transport-Security akceptuje wartość 'max-age' w sekundach, aby powiadomić przeglądarkę, jak długo powinien uzyskiwać dostęp do witryny przy użyciu tylko HTTPS, oraz wartość „includeSubDomains”, aby zastosować regułę ścisłego transportu do wszystkich poddomeny witryny.

Przykład nagłówka - zasady HSTS włączone na tydzień, obejmują poddomeny
```
Strict-Transport-Security: max-age=2592000; includeSubDomains
```

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#hsts)

🔗 [Czytaj MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

<br/><br/>

### Public Key Pinning dla HTTP (HPKP)

HTTP Public Key Pinning (HPKP) to mechanizm bezpieczeństwa umożliwiający stronom HTTPS opieranie się podszywaniu się pod osoby atakujące przy użyciu nieprawidłowo wydanych lub w inny sposób fałszywych certyfikatów SSL / TLS.

Serwer webowy HTTPS udostępnia listę skrótów kluczy publicznych, a przy kolejnych połączeniach klienci oczekują, że serwer użyje jednego lub więcej kluczy publicznych w swoim łańcuchu certyfikatów. Korzystając z tej funkcji ostrożnie, można znacznie zmniejszyć ryzyko ataków typu man-in-the-middle (MITM) i innych problemów z fałszywym uwierzytelnianiem użytkowników aplikacji bez ponoszenia nadmiernego ryzyka.

Przed wdrożeniem powinieneś najpierw zajrzeć do nagłówka `Expect-CT`, ze względu na jego zaawansowaną elastyczność odzyskiwania po błędnej konfiguracji i inne [zalety](https://groups.google.com/a/chromium.org/forum/m/#!msg/blink-dev/he9tr7p3rZ8/eNMwKPmUBAAJ).

Nagłówek klucza Public-Key-Pins przyjmuje 4 wartości, `pin-sha256` wartość dodawania klucza publicznego certyfikatu, zaszyfrowana przy użyciu algorytmu SHA256, który można dodawać wiele razy dla różnych kluczy publicznych, wartość 'max-age', która informuje przeglądarkę, jak długo powinna stosować regułę, wartość „includeSubDomains” do zastosuj tę regułę do wszystkich subdomen i wartości `report-uri`, aby zgłosić niepowodzenia sprawdzania poprawności pinów dla podanego adresu URL.

Przykład nagłówka - zasady HPKP włączone na jeden tydzień, obejmują subdomeny, zgłaszają awarie do przykładowego adresu URL i zezwalają na dwa klucze publiczne
```
Public-Key-Pins: pin-sha256="d6qzRu9zOECb90Uez27xWltNsj0e1Md7GkYYkVoZWmM="; pin-sha256="E9CZ9INDbd+2eRQozYqqbQ2yXLVKB9+xcprMF+44U1g="; report-uri="http://example.com/pkp-report"; max-age=2592000; includeSubDomains
```

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#hpkp)

🔗 [Czytaj MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning)

<br/><br/>

### X-Frame-Options

Nagłówek X-Frame-Options zabezpiecza aplikację przed [Clickjacking](https://www.owasp.org/index.php/Clickjacking) atakami, deklarując zasadę, czy aplikacja może być osadzona na innych (zewnętrznych) stronach za pomocą ramek.

X-Frame-Options pozwala na 3 parametry, parametr `deny` aby uniemożliwić osadzanie zasobu w ogóle, parametr `sameorigin` umożliwiający osadzanie zasobu na tym samym hoście / źródle oraz parametr `allow-from` określający host, na którym dozwolone jest osadzanie zasobu.

Przykład nagłówka - odmowa osadzenia aplikacji
```
X-Frame-Options: deny
```

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xfo)

🔗 [Czytaj MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

<br/><br/>

### X-XSS-Protection

Ten nagłówek umożliwia filtr [Cross-site scripting](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)) w twojej przeglądarce.

Przyjmuje 4 parametry, `0` do wyłączania filtra, `1` w celu włączenia filtra i włączenia automatycznej dezynfekcji strony, `mode=block` aby włączyć filtr i zapobiec renderowaniu strony w przypadku wykrycia ataku XSS (ten parametr należy dodać do `1` za pomocą średnika, a `report = <domainToReport>` aby zgłosić naruszenie (ten parametr należy dodać na '1').

Przykład nagłówka - Włącz ochronę XSS i zgłoś naruszenia na przykładowy adres URL
```
X-XSS-Protection: 1; report=http://example.com/xss-report
```

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xxxsp)

🔗 [Czytaj OWASP Secure Headers Project](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)

<br/><br/>

### X-Content-Type-Options

Ustawienie tego nagłówka uniemożliwi przeglądarce [interpretowanie plików jako czegoś innego](https://en.wikipedia.org/wiki/Content_sniffing) niż zadeklarowany przez typ zawartości w nagłówkach HTTP.

Przykład nagłówka - Disallow Content sniffing
```
X-Content-Type-Options: nosniff
```

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#xcto)

🔗 [Czytaj MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)


<br/><br/>

### Referrer-Policy

Nagłówek Referrer-Policy HTTP określa, które informacje o odsyłaczach wysyłane w nagłówku 'Referer' powinny być dołączane do żądań.

Przyjmuje 8 parametrów, `no-referrer` parametr, aby usunąć nagłówek `Referer` całkowicie, `no-referrer-when-downgrade` aby usunąć nagłówek `Referer` gdy zejście w dół na przykład HTTPS -> HTTP, parametr `origin` aby wysłać źródło hosta (host root) jako odnośnik __only__, parametr `origin-when-cross-origin` aby wysłać origin URL pozostając na tym samym origin i wysłać host origin __only__ when inaczej, parametr `same-origin` aby wysyłać informacje o stronie odsyłającej tylko w przypadku pochodzenia z tej samej witryny i pomijać żądania dotyczące różnych źródeł, parametr `strict-origin` aby zachować nagłówek `Referer` tylko na tym samym poziomie bezpieczeństwa (HTTPS -> HTTPS) i pominąć go w mniej bezpiecznym miejscu docelowym, parametr `strict-origin-when-cross-origin` aby wysłać pełny adres URL strony odsyłającej do miejsca docelowego tego samego pochodzenia - źródła __only__ do miejsca docelowego pochodzącego z innego źródła w __same__ poziom bezpieczeństwa i brak strony odsyłającej w mniej bezpiecznym miejscu docelowym pochodzącym z innego źródła oraz parametr 'unsafe-url', aby wysłać pełne strony odsyłające do miejsc docelowych tego samego lub innego źródła.

Przykład nagłówka - Całkowite usunięcie nagłówka `Referer`
```
Referrer-Policy: no-referrer
```

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#rp)

🔗 [Czytaj MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)


<br/><br/>

### Expect-CT

Nagłówek Expect-CT jest używany przez serwer do wskazania, że przeglądarki powinny oceniać połączenia z hostem emitującym nagłówek pod kątem zgodności z [Przejrzystość certyfikatu](https://www.certificate-transparency.org/).

Nagłówek akceptuje 3 parametry, parametr „report-uri” do podania adresu URL do zgłoszenia awarii Expect-CT, parametr „enforce” sygnalizujący przeglądarce, że należy narzucić (a nie tylko zgłaszać) przejrzystość certyfikatu i odmawiać przyszłych połączeń naruszając Certificate Transparency oraz parametr „max-age” określający liczbę sekund, w których przeglądarka traktuje hosta jako znanego hosta Expect-CT.

Przykład nagłówka - Narzuć przejrzystość certyfikatu przez tydzień i zgłoś do przykładowego adresu URL
```
Expect-CT: max-age=2592000, enforce, report-uri="https://example.com/report-cert-transparency"
```

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#ect)


<br/><br/>

### Content-Security-Policy

Nagłówek odpowiedzi HTTP Content-Security-Policy pozwala kontrolować zasoby, które agent użytkownika może załadować dla danej strony. Z kilkoma wyjątkami zasady obejmują przede wszystkim określenie pochodzenia serwera i punktów końcowych skryptu. Pomaga to chronić się przed [cross-site scripting attacks (XSS)](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)).

Przykład nagłówka - Włącz CSP i wykonuj tylko skrypty z tego samego źródła
```
Content-Security-Policy: script-src 'self'
```

Istnieje wiele zasad włączonych za pomocą Content-Security-Policy, które można znaleźć na poniższych stronach.

🔗 [Czytaj OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#csp)

🔗 [Czytaj MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)


<br/><br/>

### Dodatkowe zasoby

🔗 [OWASP Secure Headers Project](https://www.owasp.org/index.php/OWASP_Secure_Headers_Project#tab=Headers)

🔗 [Node.js Security Checklist (RisingStack)](https://blog.risingstack.com/node-js-security-checklist/)


<br/><br/>
