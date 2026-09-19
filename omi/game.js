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


/*
   TRICKS = SCORE INSIDE CURRENT HAND
*/

let ourTricks = 0;

let theirTricks = 0;


/*
   TOKENS = OVERALL GAME SCORE
*/

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


/*
   AI takes a random amount of time
   between 1 and 3 seconds.

   This runs again EVERY turn,
   so the delay is always different.
*/

function getThinkingTime() {

    return (
        1000 +
        Math.random() *
        2000
    );
}


/* =========================================================
   RANDOM PLAYERS
========================================================= */

function chooseCharacters() {

    teammate =
        randomItem(
            TEAMMATES
        );


    /*
       Shuffle opponents so the
       two opponents cannot be
       the same person.
    */

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


    document.getElementById(
        "partner-name"
    ).textContent =
        teammate.name;


    document.getElementById(
        "left-name"
    ).textContent =
        opponentLeft.name;


    document.getElementById(
        "right-name"
    ).textContent =
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
   CARTOON AVATAR
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
        character.hairStyle === "bald"
        ? " bald"
        : "";


    let hairHTML = "";


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
                ">
            </div>

        `;
    }


    container.innerHTML = `

        <div
            class="avatar-face${baldClass}"
            style="
                --skin:${character.skin};
                --hair:${character.hair};
            ">

            ${hairHTML}

            <div
                class="eye eye-left">
            </div>

            <div
                class="eye eye-right">
            </div>

            <div class="mouth">
            </div>

        </div>

    `;
}


/* =========================================================
   DECK
========================================================= */

function createDeck() {

    const deck = [];


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


    if (playable) {

        const legal =
            isLegalHumanCard(
                index
            );


        if (!legal) {

            element.classList.add(
                "illegal"
            );

        }

        else {

            element.addEventListener(
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

    element.innerHTML = "";


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


        element.appendChild(
            card
        );
    }
}


/* =========================================================
   RENDER HANDS
========================================================= */

function renderHands() {

    humanHand.innerHTML = "";


    hands[0].forEach(
        (card, index) => {

            humanHand.appendChild(

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
   SORT HUMAN CARDS
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
   START HAND
========================================================= */

async function startRound() {

    roundActive = true;

    trump = null;

    currentTrick = [];

    ourTricks = 0;

    theirTricks = 0;

    waitingForHuman = false;


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


    /*
       Player to dealer's right
       selects trump.
    */

    trumpChooser =
        nextPlayer(
            dealer
        );


    statusEl.textContent =
        "Dealing first four cards...";


    /*
       FIRST FOUR CARDS
    */

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

            hands[player].push(
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


    await sleep(900);


    /*
       TRUMP SELECTION
    */

    if (
        trumpChooser === 0
    ) {

        statusEl.textContent =
            humanName +
            ", choose trump.";


        await humanChooseTrump();

    }

    else {

        statusEl.textContent =
            playerName(
                trumpChooser
            )
            +
            " is choosing trump...";


        /*
           AI also waits before
           choosing trump.
        */

        await sleep(
            getThinkingTime()
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


    /*
       SECOND FOUR CARDS
    */

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

            hands[player].push(
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


    await sleep(900);


    /*
       Trump chooser leads.
    */

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
   HUMAN TRUMP CHOICE
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
            cards.length * 4;


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


    /*
       HUMAN

       No timer.
       Human can take as long as desired.
    */

    if (
        currentPlayer === 0
    ) {

        waitingForHuman =
            true;


        statusEl.textContent =
            humanName +
            ", your turn.";


        renderHands();

        return;
    }


    /*
       AI
    */

    waitingForHuman =
        false;


    renderHands();


    statusEl.textContent =
        playerName(
            currentPlayer
        )
        +
        " is thinking...";


    /*
       RANDOM 1–3 SECOND DELAY
       EVERY SINGLE AI TURN.
    */

    const thinkingTime =
        getThinkingTime();


    await sleep(
        thinkingTime
    );


    /*
       Make sure round hasn't
       somehow ended while waiting.
    */

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


    /*
       Leading player may play
       anything.
    */

    if (
        currentTrick.length === 0
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


    const matching = [];


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


    /*
       Must follow suit if possible.
    */

    if (
        matching.length > 0
    ) {

        return matching;
    }


    /*
       Otherwise anything may
       be played.
    */

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


    /*
       All four cards have been
       played.
    */

    if (
        currentTrick.length === 4
    ) {

        /*
           Let player see final card.
        */

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
   CLEAR TABLE CARDS
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

    /*
       Same suit:
       higher rank wins.
    */

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


    /*
       Trump beats non-trump.
    */

    if (
        challenger.suit ===
        trump
        &&
        current.suit !==
        trump
    ) {

        return true;
    }


    /*
       Non-trump cannot beat
       trump.
    */

    if (
        challenger.suit !==
        trump
        &&
        current.suit ===
        trump
    ) {

        return false;
    }


    /*
       Lead suit beats another
       non-trump suit.
    */

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
   CURRENT WINNING CARD
========================================================= */

function currentWinningPlay() {

    if (
        currentTrick.length === 0
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
        i < currentTrick.length;
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
   ANIMATE TRICK TO WINNING TEAM
========================================================= */

async function animateTrickToScore(
    winningTeam
) {

    const animationLayer =
        document.getElementById(
            "animation-layer"
        );


    /*
       IMPORTANT:

       Cards fly to the TRICK SCORE,
       not the overall token score.
    */

    const target =
        winningTeam === 0

        ? document.getElementById(
            "our-trick-target"
        )

        : document.getElementById(
            "their-trick-target"
        );


    const targetRect =
        target
            .getBoundingClientRect();


    const targetX =
        targetRect.left +
        targetRect.width / 2;


    const targetY =
        targetRect.top +
        targetRect.height / 2;


    const clones = [];


    /*
       Copy all four played cards.
    */

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


        if (!original) {

            continue;
        }


        const rect =
            original
                .getBoundingClientRect();


        const clone =
            original.cloneNode(
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


    /*
       Remove originals.
    */

    clearPlayedCards();


    /*
       Give browser a moment to
       render clones in original
       positions.
    */

    await sleep(
        70
    );


    /*
       Send all four cards toward
       the winning team's collector.
    */

    clones.forEach(
        (card, index) => {

            const offset =
                (
                    index -
                    1.5
                )
                * 4;


            card.style.left =
                (
                    targetX
                    -
                    card.offsetWidth / 2
                    +
                    offset
                )
                +
                "px";


            card.style.top =
                (
                    targetY
                    -
                    card.offsetHeight / 2
                    +
                    offset
                )
                +
                "px";


            card.style.transform =
                `
                scale(0.25)
                rotate(${(
                    index - 1.5
                ) * 7}deg)
                `;


            card.style.opacity =
                "0";
        }
    );


    /*
       Wait for animation.
    */

    await sleep(
        820
    );


    clones.forEach(
        card =>
            card.remove()
    );


    /*
       Flash collector.
    */

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
   FINISH TRICK
========================================================= */

async function finishTrick() {

    const winner =
        currentWinningPlay();


    /*
       Players 0 and 2 = our team.
       Players 1 and 3 = opponents.
    */

    const winningTeam =
        winner.player % 2;


    statusEl.textContent =
        playerName(
            winner.player
        )
        +
        " won the trick.";


    /*
       FIRST:
       Cards fly away.
    */

    await animateTrickToScore(
        winningTeam
    );


    /*
       SECOND:
       Trick score changes.
    */

    if (
        winningTeam === 0
    ) {

        ourTricks++;

    }

    else {

        theirTricks++;
    }


    updateScore();


    /*
       Pause before next trick.
    */

    await sleep(
        700
    );


    currentTrick = [];


    /*
       8 tricks = hand finished.
    */

    if (
        ourTricks +
        theirTricks ===
        8
    ) {

        finishRound();

        return;
    }


    /*
       Trick winner leads next.
    */

    currentPlayer =
        winner.player;


    playTurn();
}


/* =========================================================
   AI CARD SELECTION
========================================================= */

function chooseAICard(
    player
) {

    const legal =
        legalCardIndexes(
            player
        );


    /*
       AI LEADING
    */

    if (
        currentTrick.length === 0
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


    /*
       Find cards capable of
       currently winning.
    */

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


    /*
       Partner already winning.

       Usually throw weakest card.
    */

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


    /*
       Opponent winning.

       Use cheapest winning card.
    */

    if (
        winningOptions.length > 0
    ) {

        return lowestCard(
            player,
            winningOptions
        );
    }


    /*
       Cannot win.

       Throw weakest legal card.
    */

    return lowestCard(
        player,
        legal
    );
}


/* =========================================================
   AI LEAD CARD
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


        /*
           Preserve trump slightly.
        */

        if (
            card.suit ===
            trump
        ) {

            score -=
                1.5;
        }


        /*
           Small randomness keeps
           AI from behaving exactly
           the same every game.
        */

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


        /*
           AI tries to preserve trump.
        */

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
   FINISH HAND / TOKEN SCORING
========================================================= */

function finishRound() {

    roundActive =
        false;


    waitingForHuman =
        false;


    const chooserTeam =
        trumpChooser % 2;


    let winningTeam;

    let tokens;


    /*
       4–4 tie.

       Carry one token into
       following hand.
    */

    if (
        ourTricks === 4
        &&
        theirTricks === 4
    ) {

        carryToken++;


        showRoundResult(

            "4–4 Draw",

            "The hand ended 4–4. No token is awarded yet. The next winning hand carries an extra token."

        );


        return;
    }


    /*
       Determine hand winner.
    */

    winningTeam =
        ourTricks >
        theirTricks

        ? 0

        : 1;


    /*
       8–0 = Kapothi.
    */

    if (
        ourTricks === 8
        ||
        theirTricks === 8
    ) {

        tokens =
            3;

    }


    /*
       Trump choosing team won.
    */

    else if (
        winningTeam ===
        chooserTeam
    ) {

        tokens =
            1;

    }


    /*
       Team that did NOT choose
       trump defeated trump team.
    */

    else {

        tokens =
            2;
    }


    /*
       Add carried tokens.
    */

    tokens +=
        carryToken;


    carryToken =
        0;


    /*
       NOW the overall score
       finally changes.
    */

    if (
        winningTeam === 0
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
        ourTricks === 8
        ||
        theirTricks === 8
    ) {

        title =
            "Kapothi!";

    }

    else if (
        winningTeam === 0
    ) {

        title =
            "Your Team Wins the Hand";

    }

    else {

        title =
            "Opponents Win the Hand";
    }


    const text =

        `Your team won ${ourTricks} tricks. ` +

        `The opponents won ${theirTricks} tricks. ` +

        `${tokens} token${tokens === 1 ? "" : "s"} awarded.`;


    /*
       FIRST TO 10 TOKENS
    */

    if (
        ourScore >= 10
        ||
        theirScore >= 10
    ) {

        showGameOver(
            ourScore >= 10
        );


        return;
    }


    showRoundResult(
        title,
        text
    );
}


/* =========================================================
   HAND RESULT
========================================================= */

function showRoundResult(
    title,
    text
) {

    document.getElementById(
        "result-title"
    ).textContent =
        title;


    document.getElementById(
        "result-text"
    ).textContent =
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

    document.getElementById(
        "game-over-title"
    ).textContent =

        humanWon

        ? "Your Team Wins!"

        : "Opponents Win";


    document.getElementById(
        "game-over-text"
    ).textContent =

        `Final token score: ${ourScore} – ${theirScore}`;


    gameOverModal
        .classList
        .remove(
            "hidden"
        );
}


/* =========================================================
   UPDATE SCORES
========================================================= */

function updateScore() {

    /*
       CURRENT HAND
    */

    ourTricksEl.textContent =
        ourTricks;


    theirTricksEl.textContent =
        theirTricks;


    /*
       OVERALL GAME
    */

    teamScoreEl.textContent =
        ourScore;


    opponentScoreEl.textContent =
        theirScore;
}


/* =========================================================
   PLAYER NAMES
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
                ? opponentLeft.name
                : "Opponent";


        case 2:

            return teammate
                ? teammate.name
                : "Partner";


        case 3:

            return opponentRight
                ? opponentRight.name
                : "Opponent";


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
        enteredName === ""
    ) {

        enteredName =
            "Player";
    }


    humanName =
        enteredName;


    document.getElementById(
        "human-name"
    ).textContent =
        humanName;


    /*
       Random teammate and
       opponents chosen here.
    */

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
   START BUTTON
========================================================= */

document.getElementById(
    "start-game"
)
.addEventListener(
    "click",
    beginGame
);


/* ENTER KEY */

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

document.getElementById(
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


        /*
           Move dealer.
        */

        dealer =
            nextPlayer(
                dealer
            );


        startRound();
    }
);


/* =========================================================
   PLAY AGAIN
========================================================= */

document.getElementById(
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


        gameOverModal
            .classList
            .add(
                "hidden"
            );


        /*
           New random characters
           for a completely new game.
        */

        chooseCharacters();


        updateScore();


        startRound();
    }
);


/* =========================================================
   INITIAL PAGE
========================================================= */

updateScore();


nameInput.focus();
