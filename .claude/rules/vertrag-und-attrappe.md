---
paths:
  - "src/vertrag/**"
  - "src/attrappe/**"
---

# Vertrag und Attrappe

- `src/vertrag/` ist die einzige Beschreibung der Daten: Typen je Art von Eintrag und die Liste der Anfragen. Attrappe und späterer Server halten sich beide daran.
- Eine Änderung am Vertrag ist eine Entscheidung. Sie kommt mit Datum in `docs/ENTSCHEIDUNGEN.md`.
- Jeder Eintrag trägt die Grundfelder: Art, Raum, Zeit (Punkt oder Dauer), Zustand, Verknüpfungen.
- Die Attrappe beantwortet Anfragen über Mock Service Worker. Die Oberfläche merkt keinen Unterschied zum echten Server.
- Die Attrappe merkt sich Änderungen im Browser: Archiviertes ist weg, Gespeichertes bleibt, Rückgängig stellt wieder her.
- Jede ändernde Anfrage hat eine Gegen-Anfrage für Rückgängig.
- Die Attrappe antwortet mit kurzer Verzögerung und kann auf Wunsch Fehler liefern, damit Lade- und Fehlerzustände sichtbar werden.
- Beispieldaten sind erfunden, deutsch und zahlreich genug, dass Listen scrollen. Keine echten Adressen, Namen von Bekannten oder Beträge des Nutzers.
- Daten sind relativ zu heute, damit die Seite an jedem Tag stimmig aussieht. Kein fest eingetragener Wochentag.
- Einstellungen und Anordnungen liegen im Prototyp im Speicher des Browsers, hinter derselben Schnittstelle wie später auf dem Server.
