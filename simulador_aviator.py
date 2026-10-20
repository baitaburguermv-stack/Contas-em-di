#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simulador de Aviator / Crash (Tigrinho e similares)
====================================================

Objetivo: mostrar, com milhares de rodadas, o que acontece com a sua banca
usando diferentes estrategias de aposta -- inclusive "apostar mais alto na
hora certa".

NAO existe previsao. Cada rodada e sorteada por um RNG independente, igual ao
que roda no servidor da casa. Este simulador reproduz exatamente essa
matematica para voce ver o resultado sem arriscar dinheiro de verdade.

Rode com:  python3 simulador_aviator.py
"""

import random

# ----------------------------------------------------------------------------
# COMO O JOGO FUNCIONA (crash games)
# ----------------------------------------------------------------------------
# Um multiplicador comeca em 1.00x e sobe. Em algum ponto aleatorio ele
# "explode" (crash). Se voce sacar ANTES do crash, ganha aposta x multiplicador.
# Se o crash vier antes, voce perde a aposta inteira.
#
# A distribuicao do ponto de crash e desenhada para dar a vantagem a casa.
# Formula padrao do mercado: P(crash >= x) = (1 - edge) / x
# Com edge = 1%, isso significa um RTP de 99% -- e os sites populares de
# "Tigrinho" costumam ser BEM piores (RTP de 90% ou menos).

HOUSE_EDGE = 0.01          # 1% de vantagem da casa (otimista; a realidade e pior)

def sortear_crash():
    """Sorteia o ponto de crash de uma rodada. Totalmente aleatorio e
    independente das rodadas anteriores -- nao da pra prever."""
    r = random.random()
    if r < HOUSE_EDGE:       # chance de dar "crash instantaneo" em 1.00x
        return 1.00
    # inverso da distribuicao P(crash >= x) = (1-edge)/x
    return (1 - HOUSE_EDGE) / (1 - r)


# ----------------------------------------------------------------------------
# AS ESTRATEGIAS
# ----------------------------------------------------------------------------
# Cada estrategia recebe o historico dos ultimos crashes e a banca atual,
# e decide: quanto apostar e em que multiplicador vai tentar sacar.
# Retorna (valor_da_aposta, alvo_de_saque).

def estrategia_fixa(historico, banca, aposta_base):
    """Sempre aposta o mesmo valor e saca em 2.00x. A mais simples."""
    return aposta_base, 2.00

def estrategia_hora_certa(historico, banca, aposta_base):
    """'Apostar alto na hora certa': depois de varios crashes baixos
    seguidos, a pessoa 'sente' que vai pagar e aposta 5x mais alto.
    Esta e a falacia do apostador -- vamos ver no que da."""
    ultimos = historico[-3:]
    if len(ultimos) == 3 and all(c < 2.00 for c in ultimos):
        return aposta_base * 5, 2.00   # "ta quente, vou forte!"
    return aposta_base, 2.00

def estrategia_martingale(historico, banca, aposta_base, estado):
    """Martingale: dobra a aposta a cada perda, tentando recuperar tudo
    mais o lucro de uma aposta. Saca em 2.00x."""
    aposta = aposta_base * (2 ** estado["perdas_seguidas"])
    aposta = min(aposta, banca)        # nao da pra apostar mais do que tem
    return aposta, 2.00


# ----------------------------------------------------------------------------
# O MOTOR DA SIMULACAO
# ----------------------------------------------------------------------------

def simular(nome, decisor, banca_inicial=1000.0, aposta_base=10.0, rodadas=100_000):
    banca = banca_inicial
    historico = []
    estado = {"perdas_seguidas": 0}
    pico = banca
    quebrou_em = None

    for i in range(1, rodadas + 1):
        if banca < 0.01:                 # quebrou: sem dinheiro pra apostar
            quebrou_em = i
            break

        if "Martingale" in nome:
            aposta, alvo = decisor(historico, banca, aposta_base, estado)
        else:
            aposta, alvo = decisor(historico, banca, aposta_base)
        aposta = min(aposta, banca)

        crash = sortear_crash()
        historico.append(crash)

        if crash >= alvo:                # sacou a tempo -> ganhou
            banca += aposta * (alvo - 1)
            estado["perdas_seguidas"] = 0
        else:                            # crash antes do saque -> perdeu tudo
            banca -= aposta
            estado["perdas_seguidas"] += 1

        pico = max(pico, banca)

    return {
        "nome": nome,
        "banca_inicial": banca_inicial,
        "banca_final": banca,
        "pico": pico,
        "rodadas_jogadas": quebrou_em - 1 if quebrou_em else rodadas,
        "quebrou_em": quebrou_em,
    }


def barra(valor, maximo, largura=40):
    n = int(largura * max(valor, 0) / maximo) if maximo > 0 else 0
    return "#" * n + "." * (largura - n)


def relatorio(resultados, rodadas):
    maximo = max(r["banca_inicial"] for r in resultados)
    print("\n" + "=" * 68)
    print(f"RESULTADO APOS ATE {rodadas:,} RODADAS".replace(",", "."))
    print(f"(banca inicial: R$ {resultados[0]['banca_inicial']:.2f}  |  "
          f"aposta base: R$ 10,00  |  RTP da casa: {100*(1-HOUSE_EDGE):.0f}%)")
    print("=" * 68)
    for r in resultados:
        final = r["banca_final"]
        lucro = final - r["banca_inicial"]
        status = (f"QUEBROU na rodada {r['quebrou_em']:,}".replace(",", ".")
                  if r["quebrou_em"] else "sobreviveu, mas no vermelho"
                  if lucro < 0 else "sobreviveu no azul")
        print(f"\n> {r['nome']}")
        print(f"   banca final : R$ {final:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
        print(f"   lucro/preju : R$ {lucro:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
        print(f"   pico atingido: R$ {r['pico']:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
        print(f"   {barra(final, maximo)}  {status}")
    print("\n" + "=" * 68)
    print("CONCLUSAO: toda estrategia tende ao prejuizo. Apostar mais alto")
    print("('hora certa') ou dobrar ('Martingale') so faz voce chegar la")
    print("mais rapido. Nao existe previsao -- o crash e sorteado e")
    print("independente a cada rodada.")
    print("=" * 68 + "\n")


if __name__ == "__main__":
    RODADAS = 100_000
    BANCA = 1000.0
    APOSTA = 10.0

    random.seed()  # troque por um numero fixo (ex: random.seed(42)) p/ repetir

    resultados = [
        simular("Aposta fixa (saca em 2x)",
                estrategia_fixa, BANCA, APOSTA, RODADAS),
        simular("Apostar alto na 'hora certa'",
                estrategia_hora_certa, BANCA, APOSTA, RODADAS),
        simular("Martingale (dobra na perda)",
                estrategia_martingale, BANCA, APOSTA, RODADAS),
    ]
    relatorio(resultados, RODADAS)
