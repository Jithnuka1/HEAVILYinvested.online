/* ==========================================
   OMI
   Human = Player 0
   Opponent = Player 1
   Partner = Player 2
   Opponent = Player 3

   Play proceeds counter-clockwise:
   0 → 3 → 2 → 1 → 0
========================================== */


const SUITS = ["♠", "♥", "♦", "♣"];

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


/* ==========================================
   GAME STATE
========================================== */

let hands = [[], [], [], []];

let dealer = 1;

let trumpChooser = 0;

let trump = null;

let currentPlayer = 0;

let currentTrick = [];

let ourTricks = 0;
let theirTricks = 0;

let ourScore = 0;
let theirScore = 0;

let carryToken = 0;

let roundActive = false;

let waitingForHuman = false;


/* ==========================================
   ELEMENTS
========================================== */

const humanHand =
    document.getElementById("human-hand");

const partnerHand =
    document.getElementById("partner-hand");

const leftHand =
    document.getElementById("left-hand");

const rightHand =
    document.getElementById("right-hand");


const statusEl =
    document.getElementById("round-status");

const trumpEl =
    document.getElementById("trump-display");

const ourTricksEl =
    document.getElementById("our-tricks");

const theirTricksEl =
    document.getElementById("their-tricks");

const teamScoreEl =
    document.getElementById("team-score");

const opponentScoreEl =
    document.getElementById("opponent-score");


const trumpModal =
    document.getElementById("trump-modal");

const resultModal =
    document.getElementById("result-modal");

const gameOverModal =
    document.getElementById("game-over-modal");


/* ==========================================
   HELPERS
========================================== */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
}


function nextPlayer(player) {

    /*
       Counter-clockwise order:

       0 → 3 → 2 → 1 → 0
    */

    return (player + 3) % 4;
}


function sameTeam(a, b) {

    return (a % 2) === (b % 2);
}


function suitIsRed(suit) {

    return suit === "♥" ||
           suit === "♦";
}


/* ==========================================
   DECK
========================================== */

function createDeck() {

    const deck = [];

    for (const suit of SUITS) {

        for (const rank of RANKS) {

            deck.push({
                suit,
                rank
            });
        }
    }

    return deck;
}


function shuffle(deck) {

    for (
        let i = deck.length - 1;
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


/* ==========================================
   CARD HTML
========================================== */

function createCardElement(
    card,
    playable = false,
    index = null
) {

    const el =
        document.createElement("div");

    el.className =
        "card" +
        (
            suitIsRed(card.suit)
            ? " red"
            : ""
        );


    el.innerHTML = `

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
            isLegalHumanCard(index);

        if (!legal) {

            el.classList.add(
                "illegal"
            );

        } else {

            el.addEventListener(
                "click",
                () =>
                    humanPlay(index)
            );
        }
    }

    return el;
}


/* ==========================================
   CARD BACKS
========================================== */

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
            document.createElement("div");

        card.className =
            "card-back";

        element.appendChild(card);
    }
}


/* ==========================================
   RENDER HANDS
========================================== */

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


/* ==========================================
   SORT HUMAN HAND
========================================== */

function sortHumanHand() {

    hands[0].sort(
        (a, b) => {

            const suitDiff =
                SUITS.indexOf(a.suit) -
                SUITS.indexOf(b.suit);

            if (suitDiff !== 0)
                return suitDiff;

            return (
                RANK_VALUE[b.rank] -
                RANK_VALUE[a.rank]
            );
        }
    );
}


/* ==========================================
   NEW ROUND
========================================== */

async function startRound() {

    roundActive = true;

    trump = null;

    currentTrick = [];

    ourTricks = 0;
    theirTricks = 0;

    waitingForHuman = false;

    hands = [[], [], [], []];


    clearPlayedCards();

    updateScore();


    const deck =
        shuffle(
            createDeck()
        );


    /*
       Trump chooser is player
       immediately to dealer's right.
    */

    trumpChooser =
        nextPlayer(dealer);


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
                nextPlayer(player);
        }
    }


    sortHumanHand();
    renderHands();

    await sleep(700);


    /*
       TRUMP CHOICE
    */

    if (trumpChooser === 0) {

        statusEl.textContent =
            "Choose the trump suit.";

        await humanChooseTrump();

    } else {

        statusEl.textContent =
            playerName(trumpChooser) +
            " is choosing trump...";

        await sleep(1000);

        trump =
            aiChooseTrump(
                hands[trumpChooser]
            );
    }


    trumpEl.textContent =
        "Trump: " + trump;


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
                nextPlayer(player);
        }
    }


    sortHumanHand();

    renderHands();

    await sleep(800);


    currentPlayer =
        trumpChooser;


    statusEl.textContent =
        playerName(currentPlayer) +
        " leads.";


    playTurn();
}


/* ==========================================
   HUMAN TRUMP
========================================== */

function humanChooseTrump() {

    return new Promise(
        resolve => {

            trumpModal.classList.remove(
                "hidden"
            );


            const buttons =
                trumpModal.querySelectorAll(
                    "[data-suit]"
                );


            function select(event) {

                trump =
                    event.currentTarget.dataset.suit;


                trumpModal.classList.add(
                    "hidden"
                );


                buttons.forEach(
                    button =>
                        button.removeEventListener(
                            "click",
                            select
                        )
                );


                resolve();
            }


            buttons.forEach(
                button =>
                    button.addEventListener(
                        "click",
                        select
                    )
            );
        }
    );
}


/* ==========================================
   AI TRUMP CHOICE
========================================== */

function aiChooseTrump(hand) {

    let bestSuit =
        SUITS[0];

    let bestScore =
        -Infinity;


    for (const suit of SUITS) {

        let score = 0;


        const cards =
            hand.filter(
                card =>
                    card.suit === suit
            );


        score +=
            cards.length * 4;


        for (const card of cards) {

            score +=
                RANK_VALUE[card.rank];
        }


        if (score > bestScore) {

            bestScore = score;
            bestSuit = suit;
        }
    }


    return bestSuit;
}


/* ==========================================
   TURN SYSTEM
========================================== */

async function playTurn() {

    if (!roundActive)
        return;


    renderHands();


    if (currentPlayer === 0) {

        waitingForHuman = true;

        statusEl.textContent =
            "Your turn.";

        renderHands();

        return;
    }


    waitingForHuman = false;

    renderHands();


    statusEl.textContent =
        playerName(currentPlayer) +
        " is thinking...";


    await sleep(
        650 +
        Math.random() * 450
    );


    const cardIndex =
        chooseAICard(
            currentPlayer
        );


    playCard(
        currentPlayer,
        cardIndex
    );
}


/* ==========================================
   LEGAL CARDS
========================================== */

function legalCardIndexes(player) {

    const hand =
        hands[player];


    if (currentTrick.length === 0) {

        return hand.map(
            (_, index) =>
                index
        );
    }


    const leadSuit =
        currentTrick[0].card.suit;


    const matching = [];


    hand.forEach(
        (card, index) => {

            if (
                card.suit === leadSuit
            ) {

                matching.push(index);
            }
        }
    );


    if (matching.length > 0)
        return matching;


    return hand.map(
        (_, index) =>
            index
    );
}


function isLegalHumanCard(index) {

    if (!waitingForHuman)
        return false;

    return legalCardIndexes(0)
        .includes(index);
}


/* ==========================================
   HUMAN PLAY
========================================== */

function humanPlay(index) {

    if (!waitingForHuman)
        return;


    if (!isLegalHumanCard(index))
        return;


    waitingForHuman = false;


    playCard(
        0,
        index
    );
}


/* ==========================================
   PLAY CARD
========================================== */

async function playCard(
    player,
    index
) {

    const card =
        hands[player].splice(
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
        currentTrick.length === 4
    ) {

        await sleep(900);

        finishTrick();

        return;
    }


    currentPlayer =
        nextPlayer(currentPlayer);


    playTurn();
}


/* ==========================================
   SHOW PLAYED CARD
========================================== */

function renderPlayedCard(
    player,
    card
) {

    const container =
        document.getElementById(
            "played-" + player
        );


    container.innerHTML = "";


    container.appendChild(
        createCardElement(card)
    );
}


function clearPlayedCards() {

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        document.getElementById(
            "played-" + i
        ).innerHTML = "";
    }
}


/* ==========================================
   CARD COMPARISON
========================================== */

function cardBeats(
    challenger,
    current,
    leadSuit
) {

    /*
       challenger / current
       are card objects.
    */


    if (
        challenger.suit ===
        current.suit
    ) {

        return (
            RANK_VALUE[challenger.rank] >
            RANK_VALUE[current.rank]
        );
    }


    /*
       Trump beats non-trump.
    */

    if (
        challenger.suit === trump &&
        current.suit !== trump
    ) {

        return true;
    }


    if (
        challenger.suit !== trump &&
        current.suit === trump
    ) {

        return false;
    }


    /*
       If neither is trump,
       lead suit beats other suits.
    */

    if (
        challenger.suit === leadSuit &&
        current.suit !== leadSuit
    ) {

        return true;
    }


    return false;
}


/* ==========================================
   CURRENT TRICK WINNER
========================================== */

function currentWinningPlay() {

    if (
        currentTrick.length === 0
    ) {

        return null;
    }


    const leadSuit =
        currentTrick[0].card.suit;


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

            winner = play;
        }
    }


    return winner;
}


/* ==========================================
   FINISH TRICK
========================================== */

async function finishTrick() {

    const winner =
        currentWinningPlay();


    if (
        winner.player % 2 === 0
    ) {

        ourTricks++;

    } else {

        theirTricks++;
    }


    updateScore();


    statusEl.textContent =
        playerName(winner.player) +
        " won the trick.";


    await sleep(900);


    clearPlayedCards();


    currentTrick = [];


    /*
       Eight tricks played.
    */

    if (
        ourTricks +
        theirTricks === 8
    ) {

        finishRound();

        return;
    }


    currentPlayer =
        winner.player;


    playTurn();
}


/* ==========================================
   AI
========================================== */

function chooseAICard(player) {

    const legal =
        legalCardIndexes(player);


    /*
       If AI leads:
       prefer a strong card,
       but with some randomness.
    */

    if (
        currentTrick.length === 0
    ) {

        return chooseLeadCard(
            player,
            legal
        );
    }


    /*
       Determine if AI can win.
    */

    const leadSuit =
        currentTrick[0].card.suit;


    const winningPlay =
        currentWinningPlay();


    const winningOptions =
        legal.filter(
            index => {

                const card =
                    hands[player][index];


                return cardBeats(
                    card,
                    winningPlay.card,
                    leadSuit
                );
            }
        );


    /*
       If partner is already winning,
       try to throw away a weak card.
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
       Beat opponent with cheapest
       winning card possible.
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
       Discard weakest card.
    */

    return lowestCard(
        player,
        legal
    );
}


/* ==========================================
   AI LEAD
========================================== */

function chooseLeadCard(
    player,
    legal
) {

    const hand =
        hands[player];


    /*
       Score cards.
    */

    let bestIndex =
        legal[0];

    let bestScore =
        -Infinity;


    for (const index of legal) {

        const card =
            hand[index];


        let score =
            RANK_VALUE[card.rank];


        /*
           Trump cards are valuable,
           so don't always waste them.
        */

        if (
            card.suit === trump
        ) {

            score -= 1.5;
        }


        score +=
            Math.random() * 2;


        if (
            score > bestScore
        ) {

            bestScore = score;

            bestIndex = index;
        }
    }


    return bestIndex;
}


/* ==========================================
   LOWEST CARD
========================================== */

function lowestCard(
    player,
    indexes
) {

    let best =
        indexes[0];

    let bestValue =
        Infinity;


    for (const index of indexes) {

        const card =
            hands[player][index];


        let value =
            RANK_VALUE[card.rank];


        /*
           Preserve trump if possible.
        */

        if (
            card.suit === trump
        ) {

            value += 5;
        }


        if (
            value < bestValue
        ) {

            bestValue = value;

            best = index;
        }
    }


    return best;
}


/* ==========================================
   ROUND SCORING
========================================== */

function finishRound() {

    roundActive = false;

    waitingForHuman = false;


    const chooserTeam =
        trumpChooser % 2;


    let winningTeam = null;

    let tokens = 0;


    /*
       4–4 DRAW
    */

    if (
        ourTricks === 4 &&
        theirTricks === 4
    ) {

        carryToken++;

        showRoundResult(
            "4–4 Draw",
            "No tokens awarded. The next winning round carries an extra token."
        );

        return;
    }


    /*
       OUR TEAM WON
    */

    if (
        ourTricks > theirTricks
    ) {

        winningTeam = 0;

    } else {

        winningTeam = 1;
    }


    /*
       KAPOTHI
    */

    if (
        ourTricks === 8 ||
        theirTricks === 8
    ) {

        tokens = 3;

    }

    /*
       TRUMP CHOOSER'S TEAM
    */

    else if (
        winningTeam === chooserTeam
    ) {

        tokens = 1;

    }

    /*
       NON-TRUMP TEAM
    */

    else {

        tokens = 2;
    }


    tokens += carryToken;

    carryToken = 0;


    if (
        winningTeam === 0
    ) {

        ourScore += tokens;

    } else {

        theirScore += tokens;
    }


    updateScore();


    let title;

    if (
        ourTricks === 8 ||
        theirTricks === 8
    ) {

        title = "Kapothi!";

    } else {

        title =
            winningTeam === 0
            ? "Your Team Wins"
            : "Opponents Win";
    }


    const text =
        `Your team won ${ourTricks} tricks. ` +
        `Opponents won ${theirTricks}. ` +
        `${tokens} token${tokens === 1 ? "" : "s"} awarded.`;


    /*
       FIRST TO 10
    */

    if (
        ourScore >= 10 ||
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


/* ==========================================
   ROUND RESULT
========================================== */

function showRoundResult(
    title,
    text
) {

    document.getElementById(
        "result-title"
    ).textContent = title;


    document.getElementById(
        "result-text"
    ).textContent = text;


    resultModal.classList.remove(
        "hidden"
    );
}


/* ==========================================
   GAME OVER
========================================== */

function showGameOver(
    humanWon
) {

    const title =
        document.getElementById(
            "game-over-title"
        );


    const text =
        document.getElementById(
            "game-over-text"
        );


    title.textContent =
        humanWon
        ? "You Win!"
        : "Opponents Win";


    text.textContent =
        `Final score: ${ourScore} – ${theirScore}`;


    gameOverModal.classList.remove(
        "hidden"
    );
}


/* ==========================================
   SCORE DISPLAY
========================================== */

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


/* ==========================================
   PLAYER NAMES
========================================== */

function playerName(player) {

    switch (player) {

        case 0:
            return "You";

        case 1:
            return "Opponent 1";

        case 2:
            return "Partner";

        case 3:
            return "Opponent 2";

        default:
            return "Player";
    }
}


/* ==========================================
   BUTTONS
========================================== */

document
    .getElementById(
        "next-round"
    )
    .addEventListener(
        "click",
        () => {

            resultModal.classList.add(
                "hidden"
            );


            /*
               Deal passes to the right.
            */

            dealer =
                nextPlayer(dealer);


            startRound();
        }
    );


document
    .getElementById(
        "restart-game"
    )
    .addEventListener(
        "click",
        () => {

            ourScore = 0;
            theirScore = 0;

            carryToken = 0;

            dealer = 1;

            gameOverModal.classList.add(
                "hidden"
            );

            updateScore();

            startRound();
        }
    );


/* ==========================================
   START GAME
========================================== */

updateScore();

startRound();
