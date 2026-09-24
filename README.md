# Espelho dos dados abertos CEIS e CNEP

Este repositório publica uma cópia dos arquivos ZIP oficiais de [CEIS](https://portaldatransparencia.gov.br/download-de-dados/ceis) e [CNEP](https://portaldatransparencia.gov.br/download-de-dados/cnep), mantidos pela Controladoria-Geral da União. Nenhum dado é criado ou alterado; `manifest.json` registra a data da fonte, o endereço de origem e o SHA-256 de cada ZIP.

O fluxo diário baixa a publicação mais recente e substitui os anexos da release `cgu-latest`. O CIE verifica o hash antes de usar o arquivo. Quando a atualização falha, permanece a data da última publicação validada e a consulta deve informar essa data.
