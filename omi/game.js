/* =========================================================
   OMI

   PLAYER 0 = HUMAN
   PLAYER 1 = LEFT OPPONENT
   PLAYER 2 = TEAMMATE
   PLAYER 3 = RIGHT OPPONENT

   COUNTER-CLOCKWISE:
   0 → 3 → 2 → 1 → 0
========================================================= */


const SUITS = [
    "♠",
    "♥",
    "♦",
    "♣"
];


const RANKS = [
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A"
];


const RANK_VALUE = {
    "7": 0,
    "8": 1,
    "9": 2,
    "10": 3,
    "J": 4,
    "Q": 5,
    "K": 6,
    "A": 7
};


/* =========================================================
   CHARACTERS
========================================================= */

const TEAMMATES = [

    {
        name: "jiggaman",
        skin: "#b97850",
        hair: "#171717",
        hairStyle: "short"
    },

    {
        name: "dominic",
        skin: "#b97850",
        hair: "#5a3626",
        hairStyle: "short"
    },

    {
        name: "luigi",
        skin: "#efd0b1",
        hair: "#171717",
        hairStyle: "short"
    },

    {
        name: "hasan",
        skin: "#efd0b1",
        hair: "#171717",
        hairStyle: "short"
    }

];


const OPPONENTS = [

    {
        name: "jeffery",
        skin: "#efd0b1",
        hair: "#eeeeea",
        hairStyle: "short"
    },

    {
        name: "sheeran",
        skin: "#efd0b1",
        hair: "#d6672c",
        hairStyle: "short"
    },

    {
        name: "aubrey",
        skin: "#b97850",
        hair: "#171717",
        hairStyle: "short"
    },

    {
        name: "kendrick",
        skin: "#7b4b32",
        hair: "#171717",
        hairStyle: "short"
    },

    {
        name: "meek",
        skin: "#efd0b1",
        hair: "#e4c36a",
        hairStyle: "long"
    },

    {
        name: "soto",
        skin: "#b97850",
        hair: "#171717",
        hairStyle: "bald"
    }

];


/* =========================================================
   GAME STATE
========================================================= */

let hands = [
    [],
    [],
    [],
    []
];


let dealer = 1;

let trumpChooser = 0;

let trump = null;

let currentPlayer = 0;

let currentTrick = [];

let previousTrick = [];


let ourTricks = 0;

let theirTricks = 0;


let ourScore = 0;

let theirScore = 0;


let carryToken = 0;

let roundActive = false;

let waitingForHuman = false;


let humanName = "You";

let teammate = null;

let opponentLeft = null;

let opponentRight = null;


/* =========================================================
   ELEMENTS
========================================================= */

const humanHand =
    document.getElementById(
        "human-hand"
    );


const partnerHand =
    document.getElementById(
        "partner-hand"
    );


const leftHand =
    document.getElementById(
        "left-hand"
    );


const rightHand =
    document.getElementById(
        "right-hand"
    );


const statusEl =
    document.getElementById(
        "round-status"
    );


const trumpEl =
    document.getElementById(
        "trump-display"
    );


const ourTricksEl =
    document.getElementById(
        "our-tricks"
    );


const theirTricksEl =
    document.getElementById(
        "their-tricks"
    );


const teamScoreEl =
    document.getElementById(
        "team-score"
    );


const opponentScoreEl =
    document.getElementById(
        "opponent-score"
    );


const trumpModal =
    document.getElementById(
        "trump-modal"
    );


const trumpCardPreview =
    document.getElementById(
        "trump-card-preview"
    );


const previousTrickButton =
    document.getElementById(
        "previous-trick-button"
    );


const previousTrickModal =
    document.getElementById(
        "previous-trick-modal"
    );


const previousTrickCards =
    document.getElementById(
        "previous-trick-cards"
    );


const resultModal =
    document.getElementById(
        "result-modal"
    );


const gameOverModal =
    document.getElementById(
        "game-over-modal"
    );


const nameModal =
    document.getElementById(
        "name-modal"
    );


const nameInput =
    document.getElementById(
        "name-input"
    );


/* =========================================================
   HELPERS
========================================================= */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


function nextPlayer(player) {

    return (
        player + 3
    ) % 4;
}


function sameTeam(a, b) {

    return (
        a % 2
    ) === (
        b % 2
    );
}


function suitIsRed(suit) {

    return (
        suit === "♥" ||
        suit === "♦"
    );
}


function randomItem(array) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];
}


function getThinkingTime() {

    return (
        1000 +
        Math.random() *
        2000
    );
}


/* =========================================================
   THINKING INDICATOR
========================================================= */

function getPlayerIdentity(player) {

    if (player === 1) {

        return document
            .getElementById(
                "left-name"
            )
            .closest(
                ".identity"
            );
    }


    if (player === 2) {

        return document
            .getElementById(
                "partner-name"
            )
            .closest(
                ".identity"
            );
    }


    if (player === 3) {

        return document
            .getElementById(
                "right-name"
            )
            .closest(
                ".identity"
            );
    }


    return null;
}


function clearThinkingIndicators() {

    document
        .querySelectorAll(
            ".identity"
        )
        .forEach(
            identity => {

                identity
                    .classList
                    .remove(
                        "ai-thinking"
                    );


                const dots =
                    identity
                        .querySelector(
                            ".thinking-dots"
                        );


                if (dots) {

                    dots.textContent =
                        "";
                }
            }
        );
}


async function showThinkingDots(
    player,
    duration
) {

    clearThinkingIndicators();


    const identity =
        getPlayerIdentity(
            player
        );


    if (!identity) {

        await sleep(
            duration
        );

        return;
    }


    const dots =
        identity
            .querySelector(
                ".thinking-dots"
            );


    identity
        .classList
        .add(
            "ai-thinking"
        );


    const patterns = [
        ".",
        "..",
        "...",
        ""
    ];


    let patternIndex =
        0;


    const startTime =
        Date.now();


    while (
        Date.now() -
        startTime <
        duration
    ) {

        dots.textContent =
            patterns[
                patternIndex
            ];


        patternIndex =
            (
                patternIndex + 1
            )
            %
            patterns.length;


        const elapsed =
            Date.now() -
            startTime;


        const remaining =
            duration -
            elapsed;


        if (
            remaining <= 0
        ) {

            break;
        }


        await sleep(
            Math.min(
                300,
                remaining
            )
        );
    }


    dots.textContent =
        "";


    identity
        .classList
        .remove(
            "ai-thinking"
        );
}


/* =========================================================
   CHARACTERS
========================================================= */

function chooseCharacters() {

    teammate =
        randomItem(
            TEAMMATES
        );


    const shuffled =
        [...OPPONENTS];


    for (
        let i =
            shuffled.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];
    }


    opponentLeft =
        shuffled[0];


    opponentRight =
        shuffled[1];


    document
        .getElementById(
            "partner-name"
        )
        .textContent =
            teammate.name;


    document
        .getElementById(
            "left-name"
        )
        .textContent =
            opponentLeft.name;


    document
        .getElementById(
            "right-name"
        )
        .textContent =
            opponentRight.name;


    createAvatar(
        "partner-avatar",
        teammate
    );


    createAvatar(
        "left-avatar",
        opponentLeft
    );


    createAvatar(
        "right-avatar",
        opponentRight
    );
}


/* =========================================================
   AVATARS
========================================================= */

function createAvatar(
    elementId,
    character
) {

    const container =
        document.getElementById(
            elementId
        );


    const baldClass =
        character.hairStyle ===
        "bald"

        ? " bald"

        : "";


    let hairHTML =
        "";


    if (
        character.hairStyle !==
        "bald"
    ) {

        hairHTML = `

            <div
                class="hair ${character.hairStyle}"
                style="
                    --hair:${character.hair};
                    --skin:${character.skin};
                    background:${character.hair};
                "
            ></div>

        `;
    }


    container.innerHTML = `

        <div
            class="avatar-face${baldClass}"
            style="
                --skin:${character.skin};
                --hair:${character.hair};
            "
        >

            ${hairHTML}

            <div class="eye eye-left"></div>

            <div class="eye eye-right"></div>

            <div class="mouth"></div>

        </div>

    `;
}


/* =========================================================
   DECK
========================================================= */

function createDeck() {

    const deck =
        [];


    for (
        const suit of SUITS
    ) {

        for (
            const rank of RANKS
        ) {

            deck.push({
                suit,
                rank
            });
        }
    }


    return deck;
}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(deck) {

    for (
        let i =
            deck.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            deck[i],
            deck[j]
        ] =
        [
            deck[j],
            deck[i]
        ];
    }


    return deck;
}


/* =========================================================
   CREATE CARD
========================================================= */

function createCardElement(
    card,
    playable = false,
    index = null
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "card" +
        (
            suitIsRed(
                card.suit
            )

            ? " red"

            : ""
        );


    element.innerHTML = `

        <div class="card-rank">
            ${card.rank}
        </div>

        <div class="card-suit-small">
            ${card.suit}
        </div>

        <div class="card-suit">
            ${card.suit}
        </div>

    `;


    if (
        playable
    ) {

        const legal =
            isLegalHumanCard(
                index
            );


        if (
            !legal
        ) {

            element
                .classList
                .add(
                    "illegal"
                );

        }

        else {

            element
                .addEventListener(
                    "click",
                    () => {

                        humanPlay(
                            index
                        );

                    }
                );
        }
    }


    return element;
}


/* =========================================================
   CARD BACKS
========================================================= */

function renderBacks(
    element,
    amount
) {

    element.innerHTML =
        "";


    for (
        let i = 0;

        i < amount;

        i++
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "card-back";


        /*
           z-index makes the later cards sit above
           the earlier cards.

           This keeps the final card completely visible
           while the earlier cards show only their exposed
           strip.
        */

        card.style.zIndex =
            i + 1;


        element.appendChild(
            card
        );
    }
}


/* =========================================================
   RENDER HANDS
========================================================= */

function renderHands() {

    humanHand.innerHTML =
        "";


    hands[0].forEach(
        (card, index) => {

            humanHand
                .appendChild(

                    createCardElement(
                        card,
                        waitingForHuman,
                        index
                    )

                );
        }
    );


    renderBacks(
        partnerHand,
        hands[2].length
    );


    renderBacks(
        leftHand,
        hands[1].length
    );


    renderBacks(
        rightHand,
        hands[3].length
    );
}


/* =========================================================
   SORT HUMAN HAND
========================================================= */

function sortHumanHand() {

    hands[0].sort(
        (a, b) => {

            const suitDifference =
                SUITS.indexOf(
                    a.suit
                )
                -
                SUITS.indexOf(
                    b.suit
                );


            if (
                suitDifference !== 0
            ) {

                return suitDifference;
            }


            return (
                RANK_VALUE[
                    b.rank
                ]
                -
                RANK_VALUE[
                    a.rank
                ]
            );
        }
    );
}


/* =========================================================
   TRUMP PREVIEW
========================================================= */

function renderTrumpPreview() {

    trumpCardPreview.innerHTML =
        "";


    hands[0].forEach(
        card => {

            trumpCardPreview
                .appendChild(
                    createCardElement(
                        card
                    )
                );
        }
    );
}


/* =========================================================
   PREVIOUS TRICK
========================================================= */

function savePreviousTrick() {

    previousTrick =
        currentTrick.map(
            play => ({
                player:
                    play.player,

                card: {
                    suit:
                        play.card.suit,

                    rank:
                        play.card.rank
                }
            })
        );


    previousTrickButton.disabled =
        previousTrick.length !==
        4;
}


function showPreviousTrick() {

    if (
        previousTrick.length !==
        4
    ) {

        return;
    }


    previousTrickCards.innerHTML =
        "";


    previousTrick.forEach(
        play => {

            const entry =
                document.createElement(
                    "div"
                );


            entry.className =
                "previous-card-entry";


            const label =
                document.createElement(
                    "div"
                );


            label.className =
                "previous-player-name";


            label.textContent =
                playerName(
                    play.player
                );


            entry.appendChild(
                label
            );


            entry.appendChild(
                createCardElement(
                    play.card
                )
            );


            previousTrickCards
                .appendChild(
                    entry
                );
        }
    );


    previousTrickModal
        .classList
        .remove(
            "hidden"
        );
}


/* =========================================================
   START HAND
========================================================= */

async function startRound() {

    roundActive =
        true;


    trump =
        null;


    currentTrick =
        [];


    previousTrick =
        [];


    previousTrickButton.disabled =
        true;


    ourTricks =
        0;


    theirTricks =
        0;


    waitingForHuman =
        false;


    clearThinkingIndicators();


    hands = [
        [],
        [],
        [],
        []
    ];


    clearPlayedCards();


    updateScore();


    trumpEl.textContent =
        "Trump: —";


    const deck =
        shuffle(
            createDeck()
        );


    trumpChooser =
        nextPlayer(
            dealer
        );


    statusEl.textContent =
        "Dealing first four cards...";


    /* FIRST FOUR */

    for (
        let round = 0;

        round < 4;

        round++
    ) {

        let player =
            trumpChooser;


        for (
            let count = 0;

            count < 4;

            count++
        ) {

            hands[player]
                .push(
                    deck.pop()
                );


            player =
                nextPlayer(
                    player
                );
        }
    }


    sortHumanHand();


    renderHands();


    await sleep(
        900
    );


    /* TRUMP */

    if (
        trumpChooser ===
        0
    ) {

        statusEl.textContent =
            humanName +
            ", choose trump.";


        renderTrumpPreview();


        await humanChooseTrump();

    }

    else {

        statusEl.textContent =
            playerName(
                trumpChooser
            )
            +
            " is choosing trump...";


        const thinkingTime =
            getThinkingTime();


        await showThinkingDots(
            trumpChooser,
            thinkingTime
        );


        trump =
            aiChooseTrump(
                hands[
                    trumpChooser
                ]
            );
    }


    trumpEl.textContent =
        "Trump: " +
        trump;


    /* SECOND FOUR */

    statusEl.textContent =
        "Dealing remaining cards...";


    for (
        let round = 0;

        round < 4;

        round++
    ) {

        let player =
            trumpChooser;


        for (
            let count = 0;

            count < 4;

            count++
        ) {

            hands[player]
                .push(
                    deck.pop()
                );


            player =
                nextPlayer(
                    player
                );
        }
    }


    sortHumanHand();


    renderHands();


    await sleep(
        900
    );


    currentPlayer =
        trumpChooser;


    statusEl.textContent =
        playerName(
            currentPlayer
        )
        +
        " leads.";


    playTurn();
}


/* =========================================================
   HUMAN TRUMP
========================================================= */

function humanChooseTrump() {

    return new Promise(
        resolve => {

            trumpModal
                .classList
                .remove(
                    "hidden"
                );


            const buttons =
                trumpModal
                    .querySelectorAll(
                        "[data-suit]"
                    );


            function select(
                event
            ) {

                trump =
                    event
                        .currentTarget
                        .dataset
                        .suit;


                trumpModal
                    .classList
                    .add(
                        "hidden"
                    );


                buttons.forEach(
                    button => {

                        button
                            .removeEventListener(
                                "click",
                                select
                            );

                    }
                );


                resolve();
            }


            buttons.forEach(
                button => {

                    button
                        .addEventListener(
                            "click",
                            select
                        );

                }
            );
        }
    );
}


/* =========================================================
   AI TRUMP
========================================================= */

function aiChooseTrump(
    hand
) {

    let bestSuit =
        SUITS[0];


    let bestScore =
        -Infinity;


    for (
        const suit of SUITS
    ) {

        const cards =
            hand.filter(
                card =>
                    card.suit ===
                    suit
            );


        let score =
            cards.length *
            4;


        for (
            const card of cards
        ) {

            score +=
                RANK_VALUE[
                    card.rank
                ];
        }


        if (
            score >
            bestScore
        ) {

            bestScore =
                score;


            bestSuit =
                suit;
        }
    }


    return bestSuit;
}


/* =========================================================
   TURN
========================================================= */

async function playTurn() {

    if (
        !roundActive
    ) {

        return;
    }


    renderHands();


    if (
        currentPlayer ===
        0
    ) {

        clearThinkingIndicators();


        waitingForHuman =
            true;


        statusEl.textContent =
            humanName +
            ", your turn.";


        renderHands();


        return;
    }


    waitingForHuman =
        false;


    renderHands();


    statusEl.textContent =
        playerName(
            currentPlayer
        )
        +
        " is thinking...";


    const thinkingTime =
        getThinkingTime();


    await showThinkingDots(
        currentPlayer,
        thinkingTime
    );


    if (
        !roundActive
    ) {

        return;
    }


    const cardIndex =
        chooseAICard(
            currentPlayer
        );


    playCard(
        currentPlayer,
        cardIndex
    );
}


/* =========================================================
   LEGAL CARDS
========================================================= */

function legalCardIndexes(
    player
) {

    const hand =
        hands[player];


    if (
        currentTrick.length ===
        0
    ) {

        return hand.map(
            (_, index) =>
                index
        );
    }


    const leadSuit =
        currentTrick[0]
            .card
            .suit;


    const matching =
        [];


    hand.forEach(
        (card, index) => {

            if (
                card.suit ===
                leadSuit
            ) {

                matching.push(
                    index
                );
            }
        }
    );


    if (
        matching.length >
        0
    ) {

        return matching;
    }


    return hand.map(
        (_, index) =>
            index
    );
}


/* =========================================================
   HUMAN LEGAL CARD
========================================================= */

function isLegalHumanCard(
    index
) {

    if (
        !waitingForHuman
    ) {

        return false;
    }


    return legalCardIndexes(
        0
    )
    .includes(
        index
    );
}


/* =========================================================
   HUMAN PLAY
========================================================= */

function humanPlay(
    index
) {

    if (
        !waitingForHuman
    ) {

        return;
    }


    if (
        !isLegalHumanCard(
            index
        )
    ) {

        return;
    }


    waitingForHuman =
        false;


    playCard(
        0,
        index
    );
}


/* =========================================================
   PLAY CARD
========================================================= */

async function playCard(
    player,
    index
) {

    clearThinkingIndicators();


    const card =
        hands[player]
            .splice(
                index,
                1
            )[0];


    currentTrick.push({
        player,
        card
    });


    renderHands();


    renderPlayedCard(
        player,
        card
    );


    if (
        currentTrick.length ===
        4
    ) {

        await sleep(
            900
        );


        await finishTrick();


        return;
    }


    currentPlayer =
        nextPlayer(
            currentPlayer
        );


    playTurn();
}


/* =========================================================
   RENDER PLAYED CARD
========================================================= */

function renderPlayedCard(
    player,
    card
) {

    const container =
        document.getElementById(
            "played-" +
            player
        );


    container.innerHTML =
        "";


    container.appendChild(
        createCardElement(
            card
        )
    );
}


/* =========================================================
   CLEAR PLAYED CARDS
========================================================= */

function clearPlayedCards() {

    for (
        let i = 0;

        i < 4;

        i++
    ) {

        document
            .getElementById(
                "played-" +
                i
            )
            .innerHTML =
                "";
    }
}


/* =========================================================
   CARD COMPARISON
========================================================= */

function cardBeats(
    challenger,
    current,
    leadSuit
) {

    if (
        challenger.suit ===
        current.suit
    ) {

        return (
            RANK_VALUE[
                challenger.rank
            ]
            >
            RANK_VALUE[
                current.rank
            ]
        );
    }


    if (
        challenger.suit ===
        trump
        &&
        current.suit !==
        trump
    ) {

        return true;
    }


    if (
        challenger.suit !==
        trump
        &&
        current.suit ===
        trump
    ) {

        return false;
    }


    if (
        challenger.suit ===
        leadSuit
        &&
        current.suit !==
        leadSuit
    ) {

        return true;
    }


    return false;
}


/* =========================================================
   CURRENT WINNER
========================================================= */

function currentWinningPlay() {

    if (
        currentTrick.length ===
        0
    ) {

        return null;
    }


    const leadSuit =
        currentTrick[0]
            .card
            .suit;


    let winner =
        currentTrick[0];


    for (
        let i = 1;

        i <
        currentTrick.length;

        i++
    ) {

        const play =
            currentTrick[i];


        if (
            cardBeats(
                play.card,
                winner.card,
                leadSuit
            )
        ) {

            winner =
                play;
        }
    }


    return winner;
}


/* =========================================================
   COLLECTION ANIMATION
========================================================= */

async function animateTrickToScore(
    winningTeam
) {

    const animationLayer =
        document.getElementById(
            "animation-layer"
        );


    const target =
        winningTeam ===
        0

        ?
        document.getElementById(
            "our-trick-target"
        )

        :
        document.getElementById(
            "their-trick-target"
        );


    const targetRect =
        target
            .getBoundingClientRect();


    const targetX =
        targetRect.left +
        targetRect.width /
        2;


    const targetY =
        targetRect.top +
        targetRect.height /
        2;


    const clones =
        [];


    for (
        let player = 0;

        player < 4;

        player++
    ) {

        const original =
            document.querySelector(
                "#played-" +
                player +
                " .card"
            );


        if (
            !original
        ) {

            continue;
        }


        const rect =
            original
                .getBoundingClientRect();


        const clone =
            original
                .cloneNode(
                    true
                );


        clone.classList.add(
            "flying-card"
        );


        clone.style.left =
            rect.left +
            "px";


        clone.style.top =
            rect.top +
            "px";


        clone.style.width =
            rect.width +
            "px";


        clone.style.height =
            rect.height +
            "px";


        animationLayer
            .appendChild(
                clone
            );


        clones.push(
            clone
        );
    }


    clearPlayedCards();


    await sleep(
        70
    );


    clones.forEach(
        (card, index) => {

            const offset =
                (
                    index -
                    1.5
                )
                *
                4;


            card.style.left =
                (
                    targetX
                    -
                    card.offsetWidth /
                    2
                    +
                    offset
                )
                +
                "px";


            card.style.top =
                (
                    targetY
                    -
                    card.offsetHeight /
                    2
                    +
                    offset
                )
                +
                "px";


            card.style.transform =
                `
                scale(0.25)
                rotate(${(
                    index -
                    1.5
                ) * 7}deg)
                `;


            card.style.opacity =
                "0";
        }
    );


    await sleep(
        820
    );


    clones.forEach(
        card =>
            card.remove()
    );


    target
        .classList
        .add(
            "trick-won"
        );


    await sleep(
        220
    );


    target
        .classList
        .remove(
            "trick-won"
        );
}


/* =========================================================
   FINISH FOUR-CARD ROUND
========================================================= */

async function finishTrick() {

    const winner =
        currentWinningPlay();


    const winningTeam =
        winner.player %
        2;


    savePreviousTrick();


    statusEl.textContent =
        playerName(
            winner.player
        )
        +
        " won the round.";


    await animateTrickToScore(
        winningTeam
    );


    if (
        winningTeam ===
        0
    ) {

        ourTricks++;

    }

    else {

        theirTricks++;
    }


    updateScore();


    await sleep(
        700
    );


    currentTrick =
        [];


    if (
        ourTricks +
        theirTricks ===
        8
    ) {

        finishRound();


        return;
    }


    currentPlayer =
        winner.player;


    playTurn();
}


/* =========================================================
   AI CARD CHOICE
========================================================= */

function chooseAICard(
    player
) {

    const legal =
        legalCardIndexes(
            player
        );


    if (
        currentTrick.length ===
        0
    ) {

        return chooseLeadCard(
            player,
            legal
        );
    }


    const leadSuit =
        currentTrick[0]
            .card
            .suit;


    const winningPlay =
        currentWinningPlay();


    const winningOptions =
        legal.filter(
            index => {

                const card =
                    hands[player][
                        index
                    ];


                return cardBeats(
                    card,
                    winningPlay.card,
                    leadSuit
                );
            }
        );


    if (
        sameTeam(
            player,
            winningPlay.player
        )
    ) {

        return lowestCard(
            player,
            legal
        );
    }


    if (
        winningOptions.length >
        0
    ) {

        return lowestCard(
            player,
            winningOptions
        );
    }


    return lowestCard(
        player,
        legal
    );
}


/* =========================================================
   AI LEAD
========================================================= */

function chooseLeadCard(
    player,
    legal
) {

    let bestIndex =
        legal[0];


    let bestScore =
        -Infinity;


    for (
        const index of legal
    ) {

        const card =
            hands[player][
                index
            ];


        let score =
            RANK_VALUE[
                card.rank
            ];


        if (
            card.suit ===
            trump
        ) {

            score -=
                1.5;
        }


        score +=
            Math.random() *
            2;


        if (
            score >
            bestScore
        ) {

            bestScore =
                score;


            bestIndex =
                index;
        }
    }


    return bestIndex;
}


/* =========================================================
   LOWEST CARD
========================================================= */

function lowestCard(
    player,
    indexes
) {

    let best =
        indexes[0];


    let bestValue =
        Infinity;


    for (
        const index of indexes
    ) {

        const card =
            hands[player][
                index
            ];


        let value =
            RANK_VALUE[
                card.rank
            ];


        if (
            card.suit ===
            trump
        ) {

            value +=
                5;
        }


        if (
            value <
            bestValue
        ) {

            bestValue =
                value;


            best =
                index;
        }
    }


    return best;
}


/* =========================================================
   FINISH HAND
========================================================= */

function finishRound() {

    roundActive =
        false;


    waitingForHuman =
        false;


    clearThinkingIndicators();


    const chooserTeam =
        trumpChooser %
        2;


    let winningTeam;

    let tokens;


    /* 4–4 */

    if (
        ourTricks ===
        4
        &&
        theirTricks ===
        4
    ) {

        carryToken++;


        showRoundResult(

            "4–4 Draw",

            "The hand ended 4–4. No token is awarded yet. The next winning hand carries an extra token."

        );


        return;
    }


    winningTeam =
        ourTricks >
        theirTricks

        ? 0

        : 1;


    /* KAPOTHI */

    if (
        ourTricks ===
        8
        ||
        theirTricks ===
        8
    ) {

        tokens =
            3;

    }


    /* TRUMP TEAM WINS */

    else if (
        winningTeam ===
        chooserTeam
    ) {

        tokens =
            1;

    }


    /* NON-TRUMP TEAM WINS */

    else {

        tokens =
            2;
    }


    tokens +=
        carryToken;


    carryToken =
        0;


    if (
        winningTeam ===
        0
    ) {

        ourScore +=
            tokens;

    }

    else {

        theirScore +=
            tokens;
    }


    updateScore();


    let title;


    if (
        ourTricks ===
        8
        ||
        theirTricks ===
        8
    ) {

        title =
            "Kapothi!";

    }

    else if (
        winningTeam ===
        0
    ) {

        title =
            "Your Team Wins the Hand";

    }

    else {

        title =
            "Opponents Win the Hand";
    }


    const text =

        `Your total: ${ourTricks}. ` +

        `Their total: ${theirTricks}. ` +

        `${tokens} token${tokens === 1 ? "" : "s"} awarded.`;


    if (
        ourScore >=
        10
        ||
        theirScore >=
        10
    ) {

        showGameOver(
            ourScore >=
            10
        );


        return;
    }


    showRoundResult(
        title,
        text
    );
}


/* =========================================================
   RESULT
========================================================= */

function showRoundResult(
    title,
    text
) {

    document
        .getElementById(
            "result-title"
        )
        .textContent =
            title;


    document
        .getElementById(
            "result-text"
        )
        .textContent =
            text;


    resultModal
        .classList
        .remove(
            "hidden"
        );
}


/* =========================================================
   GAME OVER
========================================================= */

function showGameOver(
    humanWon
) {

    document
        .getElementById(
            "game-over-title"
        )
        .textContent =

            humanWon

            ?
            "Your Team Wins!"

            :
            "Opponents Win";


    document
        .getElementById(
            "game-over-text"
        )
        .textContent =

            `Final token score: ${ourScore} – ${theirScore}`;


    gameOverModal
        .classList
        .remove(
            "hidden"
        );
}


/* =========================================================
   UPDATE SCORE
========================================================= */

function updateScore() {

    ourTricksEl.textContent =
        ourTricks;


    theirTricksEl.textContent =
        theirTricks;


    teamScoreEl.textContent =
        ourScore;


    opponentScoreEl.textContent =
        theirScore;
}


/* =========================================================
   PLAYER NAME
========================================================= */

function playerName(
    player
) {

    switch (
        player
    ) {

        case 0:

            return humanName;


        case 1:

            return opponentLeft

                ?
                opponentLeft.name

                :
                "Opponent";


        case 2:

            return teammate

                ?
                teammate.name

                :
                "Partner";


        case 3:

            return opponentRight

                ?
                opponentRight.name

                :
                "Opponent";


        default:

            return "Player";
    }
}


/* =========================================================
   BEGIN GAME
========================================================= */

function beginGame() {

    let enteredName =
        nameInput
            .value
            .trim();


    if (
        enteredName ===
        ""
    ) {

        enteredName =
            "Player";
    }


    humanName =
        enteredName;


    document
        .getElementById(
            "human-name"
        )
        .textContent =
            humanName;


    chooseCharacters();


    nameModal
        .classList
        .add(
            "hidden"
        );


    updateScore();


    startRound();
}


/* =========================================================
   PREVIOUS TRICK BUTTONS
========================================================= */

previousTrickButton
    .addEventListener(
        "click",
        showPreviousTrick
    );


document
    .getElementById(
        "close-previous-trick"
    )
    .addEventListener(
        "click",
        () => {

            previousTrickModal
                .classList
                .add(
                    "hidden"
                );
        }
    );


previousTrickModal
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                previousTrickModal
            ) {

                previousTrickModal
                    .classList
                    .add(
                        "hidden"
                    );
            }
        }
    );


/* =========================================================
   START
========================================================= */

document
    .getElementById(
        "start-game"
    )
    .addEventListener(
        "click",
        beginGame
    );


nameInput
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                beginGame();
            }
        }
    );


/* =========================================================
   NEXT HAND
========================================================= */

document
    .getElementById(
        "next-round"
    )
    .addEventListener(
        "click",
        () => {

            resultModal
                .classList
                .add(
                    "hidden"
                );


            dealer =
                nextPlayer(
                    dealer
                );


            startRound();
        }
    );


/* =========================================================
   RESTART
========================================================= */

document
    .getElementById(
        "restart-game"
    )
    .addEventListener(
        "click",
        () => {

            ourScore =
                0;


            theirScore =
                0;


            carryToken =
                0;


            dealer =
                1;


            previousTrick =
                [];


            previousTrickButton.disabled =
                true;


            gameOverModal
                .classList
                .add(
                    "hidden"
                );


            chooseCharacters();


            updateScore();


            startRound();
        }
    );


/* =========================================================
   INITIAL
========================================================= */

updateScore();

nameInput.focus();
