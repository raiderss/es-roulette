const app = new Vue({
  el: '#app',
  data: {
    ui: false,
    balance: 0,
    betAmount: 1.50,
    lastBet: 0,
    totalBets: 0,
    bets: {
      red: 0,
      green: 0,
      black: 0
    },
    recentColors: [],
    rouletteColors: ['red', 'black', 'red', 'green', 'black', 'red', 'green', 'black', 'green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'green'],
    originalRouletteColors: ['red', 'black', 'red', 'green', 'black', 'red', 'green', 'black', 'green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'green'],
    spinning: false,
    winner: null,
    currentBlock: 0,
    spinDuration: 3000,
    showWinMessage: false,
    winAmount: 0,
    animationTimeout: null,
    highlightInterval: null
  },
  computed: {
    repeatedColors() {
      return [...this.rouletteColors, ...this.rouletteColors, ...this.rouletteColors];
    }
  },

  created() {
    window.addEventListener('message', this.handleEventMessage);
  },

  methods: {
    handleEventMessage(event) {
      const item = event.data;
      switch (item.data) {
        case 'ROULETTE':
          this.ui = true;

          this.balance = Math.floor(item.var.cash);
          break;
      }
    },

    adjustBet(amount) {
      if (this.spinning) return;
      if (amount === 'Max') {
        this.betAmount = this.balance;
      } else if (amount < 1) {
        this.betAmount = Math.floor(this.betAmount * amount);
      } else {
        this.betAmount = Math.floor(this.betAmount + amount);
        this.lastBet = amount;
      }
    },
    clearBet() {
      if (this.spinning) return;
      this.betAmount = 1.50;
    },
    placeBet(color) {
      if (this.spinning) return;
      console.log(this.betAmount, this.balance);
      if (this.betAmount > 0 && this.betAmount <= this.balance) {
        this.bets[color] += this.betAmount;
        this.balance = Math.floor(this.balance - this.betAmount);
        this.totalBets += this.betAmount;
        this.betAmount = 0;
        this.spinRoulette();
      } else {
        console.log('Insufficient balance or invalid bet amount to place this bet.');
      }
    },
    spinRoulette() {
      const self = this;
      $.post(`https://${GetParentResourceName()}/price`, JSON.stringify(self.totalBets), function (data) {
        console.log(data);
        if (data) {
          self.spinning = true;
        } else {
          self.spinning = false;
        }
        console.log(self.spinning, self.balance);
        if (!self.spinning || self.balance <= 0) {
          if (self.balance <= 0) {
            console.log('Insufficient balance to spin the roulette');
          }
          self.spinning = false;
          return;
        }
        self.spinning = true;
        self.resetScroll();
        const totalBlocks = self.rouletteColors.length;
        const randomIndex = Math.floor(Math.random() * (53 - 40 + 1)) + 40;
        console.log("Starting spin with target index:", randomIndex);

        self.animationTimeout = setTimeout(() => {
          self.spinning = false;
          const actualIndex = (Math.floor(self.$refs.roulette.scrollLeft / self.$refs.roulette.querySelector('.color-block').offsetWidth) + Math.floor(5 / 2)) % totalBlocks;
          self.scrollToWinningBlock(randomIndex);
          self.totalBets = 0;
        }, self.spinDuration);

        self.animateSpin(randomIndex);
      }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error sending price request:', textStatus, errorThrown);
      });
    },
    animateSpin(randomIndex) {
      var sound = new Audio('./assets/sound/spin.mp3');
      sound.volume = 0.8;
      sound.onerror = function() {
          console.error("Audio failed to load at path: " + sound.src);
      };
      sound.onloadeddata = function() {
          console.log("Audio loaded successfully.");
      };
      const element = this.$refs.roulette;
      const blockWidth = element.querySelector('.color-block').offsetWidth;
      const totalBlocks = this.rouletteColors.length;
      const visibleBlocks = 5;
      const middleBlockIndex = Math.floor(visibleBlocks / 2);
      const finalIndex = randomIndex + totalBlocks * 3 - middleBlockIndex;
      sound.play();
      let currentIndex = 0;
      let interval = this.spinDuration / finalIndex;

      const spin = () => {
        if (!this.spinning) return;
        currentIndex++;
        const index = currentIndex % totalBlocks;
        this.highlightBlock(index);

        anime({
          targets: element,
          scrollLeft: blockWidth * currentIndex,
          duration: interval,
          easing: 'linear',
          complete: () => {
            if (currentIndex < finalIndex && this.spinning) {
              spin();
            } else {
              if (this.spinning) {
                clearTimeout(this.animationTimeout);
                this.spinning = false;
                const actualIndex = (Math.floor(element.scrollLeft / blockWidth) + middleBlockIndex) % totalBlocks;
                this.scrollToWinningBlock(randomIndex);
              }
            }
          }
        });

        if (currentIndex > finalIndex - totalBlocks) {
          interval += this.spinDuration / (totalBlocks * 2);
        }
      };

      spin();
    },
    highlightBlock(index) {
      const blocks = this.$refs.roulette.querySelectorAll('.color-block');
      anime({
        targets: blocks,
        border: 'none',
        scale: 1,
        filter: 'brightness(1)',
        duration: 300,
        easing: 'easeInOutQuad'
      });
      anime({
        targets: blocks[index],
        border: 'none',
        scale: 1.1,
        filter: 'brightness(1.2)',
        duration: 300,
        easing: 'easeInOutQuad'
      });
    },
    updateResults(winningIndex) {
      const normalizedIndex = winningIndex % this.repeatedColors.length;
      this.winner = normalizedIndex;
      const winningColor = this.repeatedColors[normalizedIndex];
      if (this.recentColors.length >= 7) {
        this.recentColors.shift();
      }
      this.recentColors.push(winningColor);

      const blocks = this.$refs.roulette.querySelectorAll('.color-block');
      anime({
        targets: blocks,
        border: 'none',
        scale: 1,
        filter: 'brightness(0.75)',
        duration: 300,
        easing: 'easeInOutQuad'
      });

      const winningBlock = blocks[normalizedIndex];
      if (winningBlock) {
        anime({
          targets: winningBlock,
          border: 'none',
          scale: 1.2,
          filter: 'brightness(1.5)',
          duration: 300,
          easing: 'easeInOutQuad'
        });
        console.log(`Selected block at index: ${normalizedIndex}`);
      }

      this.calculateWinnings(winningColor);

      if (this.winAmount > 0) {
        this.showWinMessage = true;
      } else {
        this.showWinMessage = false;
      }

      setTimeout(() => {
        this.showWinMessage = false;
        this.totalBets = 0;
      }, 5000);

      this.spinning = false;
      clearTimeout(this.animationTimeout);
      this.rouletteColors = [...this.originalRouletteColors];
    },
    calculateWinnings(winningColor) {
      console.log(winningColor);
      const multiplier = { red: 2, green: 14, black: 2 };
      let winnings = 0;
      if (this.bets[winningColor] > 0) {
        winnings = this.bets[winningColor] * multiplier[winningColor];
        this.balance = Math.floor(this.balance + winnings);
        $.post(`https://${GetParentResourceName()}/give`, JSON.stringify(winnings), function (data) {
          console.log('give', data);
          if (data) {
            console.log(`Kazandığınız toplam değer: ${winnings}`);
          }
        });
      } else {
        // $.post(`https://${GetParentResourceName()}/exit`, JSON.stringify({}));

        console.log(`Kaybettiğiniz toplam değer: ${this.totalBets}`);
      }
      console.log(`Kazandığınız toplam değer: ${winnings}`);

      this.totalBets = 0;
      for (let color in this.bets) {
        this.bets[color] = 0;
      }

      if (winnings > 0) {
        this.winAmount = winnings;
        this.showWinMessage = true;
        setTimeout(() => {
          this.showWinMessage = false;
        }, 5000);
      } else {
        this.winAmount = 0;
        this.showWinMessage = false;
      }
    },
    scrollToWinningBlock(winningIndex) {
      const element = this.$refs.roulette;
      const blockWidth = element.querySelector('.color-block').offsetWidth;
      const scrollTarget = blockWidth * (winningIndex % this.repeatedColors.length);
      anime({
        targets: element,
        scrollLeft: scrollTarget,
        duration: 1000,
        easing: 'easeInOutExpo',
        complete: () => {
          const hoverRange = Math.random() < 0.5 ? [40, 45] : [47, 51];
          this.highlightBlocks(hoverRange[0], hoverRange[1]);
        }
      });
    },
    highlightBlocks(startIndex, endIndex) {
      let currentIndex = startIndex;
      const highlightNext = () => {
        if (currentIndex > endIndex) {
          clearInterval(this.highlightInterval);
          this.selectWinningBlock(startIndex, endIndex);
          return;
        }
        this.highlightBlock(currentIndex);
        currentIndex++;
      };
      this.highlightInterval = setInterval(highlightNext, 200);
    },
    selectWinningBlock(startIndex, endIndex) {
      const winningIndex = Math.floor(Math.random() * (endIndex - startIndex + 1)) + startIndex;
      const winningBlock = this.$refs.roulette.querySelector(`.color-block[data-id='${winningIndex}']`);
      anime({
        targets: winningBlock,
        scale: 1.2,
        filter: 'brightness(1.5)',
        duration: 50,
        easing: 'easeInOutQuad',
        complete: () => {
          setTimeout(() => {
            anime({
              targets: winningBlock,
              scale: 1,
              filter: 'brightness(0.75)',
              duration: 50,
              easing: 'easeInOutQuad',
              complete: () => {
                this.updateResults(winningIndex);
              }
            });
          }, 1000);
        }
      });
    },
    collectWinnings() {
      this.showWinMessage = false;
    },
    resetScroll() {
      const element = this.$refs.roulette;
      element.scrollLeft = 0;
    }
  },
});

document.onkeyup = function (data) {
  if (data.which == 27) {
    app.ui = false;
    $.post(`https://${GetParentResourceName()}/exit`, JSON.stringify({}));
  }
};
