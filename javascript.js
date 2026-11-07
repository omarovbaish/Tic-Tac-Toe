const game_grid = document.querySelector("[data-tick-tack-toe]");
const choose_side_dialog = document.querySelector("[data-choose_side]");
const choose_opponent_dialog = document.querySelector("[data-choose_opponent]");
const choose_ai_difficulty = document.querySelector("[data-choose_ai_difficulty]");
const game_end_message = document.querySelector("[data-game_end_message]");
const game_end_message_title = document.querySelector("[data-results-title]");
const game_end_message_body = document.querySelector("[data-results-text]");
const stats = document.querySelector("[data-stats]")
const stats_button = document.querySelector("[data-stats-dropdown-toggle]")
const user_name_dialog = document.querySelector("[data-user-name]");
const user_name_form = document.querySelector("[data-user-name-form]");
const user_name_option = document.querySelector("[data-username-option]");
const input_username = document.querySelector("[data-username-input]");
const wins_option = document.querySelector("[data-wins_number]");
const loses_option = document.querySelector("[data-loses_number]");
const ties_option = document.querySelector("[data-ties_number]");
const wins_dialog = document.querySelector("[data-wins-dialog]");
const loses_dialog = document.querySelector("[data-loses-dialog]");
const ties_dialog = document.querySelector("[data-ties-dialog]");
const wins_text = document.querySelector("[data-wins-text]");
const loses_text = document.querySelector("[data-loses-text]");
const ties_text = document.querySelector("[data-ties-text]");
const data_history_option = document.querySelector("[data-history]");
const data_history_dialog = document.querySelector("[data-history-dialog]");
const data_history_log = document.querySelector("[data-history-log]");
const data_reset_grid = document.querySelector("[data-reset-grid]")
function random_choose(array){
        if (array.length === 0) return null;
        return array[Math.floor((Math.random() * array.length))];
}
function is_equal(array1,array2){
    if (array1.length !== array2.length) return false;
    if (array1 === array2) return true;
    for (let i = 0; i < array1.length; i++){
        if (array1[i] !== array2[i]) return false;
    }
    return true;
}
function update_stats(player,string){
        let total_games = player.wins + player.loses + player.ties;
        let winrate = (player.wins/total_games*100).toFixed(2) + "%";
        let lose_rate = (player.loses/total_games*100).toFixed(2) + "%";
        let tie_rate = (player.ties/total_games*100).toFixed(2) + "%";
        if (total_games === 0){
            winrate = "not defined";
            lose_rate = "not defined";
            tie_rate = "not defined";
        }
        wins_text.textContent = `For this Game: Your number of wins is ${player.wins}. Your winrate is ${winrate}`
        loses_text.textContent = `For this Game: Your number of loses is ${player.loses}. Your lose rate is ${lose_rate}`
        ties_text.textContent = `For this Game: Your number of ties is ${player.ties}. Your tie rate is ${tie_rate}`
        const elem = document.createElement("button");
        elem.classList.add("button");
        elem.classList.add("feed__item");
        switch(string){
            case "win": 
                elem.classList.add("feed__item--positive");
                break;
            case "lose": 
                elem.classList.add("feed__item--negative");
                break;
            case "tie": 
                elem.classList.add("feed__item--neutral");
                break;
        }
        elem.textContent = `Game ${total_games}. It was ${string}`;
        if (string === null) elem.textContent = `Game was Interrupted`
        data_history_log.prepend(elem);
        if (total_games > 50){
            data_history_log.lastElementChild.remove();
        }
    }
function Player(name,side){
        if (!new.target) throw new Error("MUST BE CALLED WITH NEW");
        this.wins = 0;
        this.loses = 0;
        this.title = "Rookie";
        this.ties = 0;
        this.name = name;
        this.side = side;
    }
    Player.prototype.update_title = function(){
        if (this.wins > 100) this.title = "Grand Exalt";
        else if (this.wins > 85) this.title ="Grandmaster";
        else if (this.wins > 70) this.title ="Master";
        else if (this.wins > 50) this.title = "Expert";
        else if (this.wins > 30) this.title ="Adept";
        else if (this.wins > 15) this.title ="Apprentice";
        else this.title = "Rookie";
    }
    Player.prototype.update_name = function(new_name){
        this.name = new_name;
    }
    Player.prototype.update_wins = function(){
        this.wins += 1;
    }
    Player.prototype.update_loses = function(){
        this.loses += 1;
    }
    Player.prototype.update_ties = function(){
        this.ties += 1;
    }
function computer(){
        const computer_modes = {
                easy: computer_easy_move,
                normal: computer_normal_move,
                hard: computer_hard_move,
        }
        const computer_player = new Player("computer",null);
        computer_player.difficulty = "easy";
        function computer_easy_move(gameboard){
            const cells = gameboard.get_cells();
            const free_cells = gameboard.get_free_cells(cells);
            return random_choose(free_cells);
        }
        function consider_situation(side,gameboard){
            const lines = gameboard.get_lines();
            function checkLine(line){
                let count_threats = 0;
                let free_cell = null;
                for (const [row_index,column_index] of line){
                    if (gameboard.get_side(row_index,column_index) === side) count_threats++;
                    else if (gameboard.get_side(row_index,column_index) === null) free_cell = [row_index,column_index];
                }
                if (count_threats === line.length - 1 && free_cell !== null) return free_cell;
                return null;
            }
            for (const line of lines){
                const result = checkLine(line);
                if (result !== null) return result;
            }
            return null;
        }
        function computer_normal_move(gameboard,opponent_side){
            const number_rows = gameboard.get_size();
            const cells = gameboard.get_cells();
            const corner_indexes = [0,number_rows-1];
            const corners = cells.filter(([row_index,column_index]) => corner_indexes.includes(row_index) && corner_indexes.includes(column_index));
            const others = gameboard.get_cells().filter(([row_index,column_index]) => !corner_indexes.includes(row_index) || !corner_indexes.includes(column_index));
            const mid_approx = Math.floor(number_rows/2);
            if (gameboard.get_side(mid_approx,mid_approx) === null) return [mid_approx,mid_approx];
            const free_corners = gameboard.get_free_cells(corners);
            const free_others = gameboard.get_free_cells(others);
            let computer_win = consider_situation(computer_player.side,gameboard);
            let computer_lose = consider_situation(opponent_side,gameboard);
            if (computer_win !== null) return computer_win;
            if (computer_lose !== null) return computer_lose;
            const random = Math.random();
            if ((random < 2/3 && free_corners.length !== 0) || free_others.length === 0){
                return random_choose(free_corners);
            }else{
                return random_choose(free_others);
            }
        }
        function computer_hard_move(gameboard,opponent_side){
            const number_rows = gameboard.get_size();
            const corner_indexes = [0,number_rows-1];
            const cells = gameboard.get_cells();
            const corners = cells.filter(([row_index,column_index]) => corner_indexes.includes(row_index) && corner_indexes.includes(column_index));
            const others = gameboard.get_cells().filter(([row_index,column_index]) => !corner_indexes.includes(row_index) || !corner_indexes.includes(column_index));
            /*In 3 x 3 this version is unbeatable. Though it plays defensive - it is not optimal ai*/
            const mid_approx = Math.floor(number_rows/2);
            if (gameboard.get_side(mid_approx,mid_approx) === null) return [mid_approx,mid_approx];
            let computer_win = consider_situation(computer_player.side,gameboard);
            let computer_lose = consider_situation(opponent_side,gameboard);
            if (computer_win !== null) return computer_win;
            if (computer_lose !== null) return computer_lose;
            let fork = forevision_fork(gameboard,opponent_side);
            if (fork !== null) return fork;
            const free_corners = gameboard.get_free_cells(corners);
            const free_others = gameboard.get_free_cells(others);
            if (free_corners.length !== 0 || free_others.length === 0){
                return random_choose(free_corners);
            }else{
                return random_choose(free_others);
            }
        }
        function forevision_fork(gameboard,opponent_side){
            const lines = gameboard.get_lines();
            const threats = [];
            for (let i = 0; i < lines.length; i++){
                for (let j = i+1; j < lines.length; j++){
                    let shared_element = null;
                    let threat = null;
                    elems: for (const first_cell of lines[i]){
                        for (const second_cell of lines[j]){
                            if (is_equal(first_cell,second_cell)){
                                shared_element = first_cell; 
                                break elems; 
                            }
                        }
                    }
                    if (shared_element) threat = analyze_threat(lines[i],gameboard,opponent_side) && analyze_threat(lines[j],gameboard,opponent_side)
                    if (shared_element !== null && gameboard.get_side(...shared_element) === null && threat){
                        threats.push(shared_element)
                    }
                }
            }
            if (threats.length === 1) return threats[0];
            if (threats.length >= 2){
                let opportunity = create_threat(gameboard,opponent_side);
                if (opportunity !== null) return opportunity;
            }
            return null;
        }
        function analyze_threat(line,gameboard,opponent_side){
            const number_rows = gameboard.get_size();
            let count = 0;
            for (const [row_index,column_index] of line){
                if (gameboard.get_side(row_index,column_index) === computer_player.side) return false;
                if (gameboard.get_side(row_index,column_index) === opponent_side) count++;
            }
            return count === number_rows - 2;
        }
        function create_threat(gameboard,opponent_side){
            const lines = gameboard.get_lines();
            const number_rows = gameboard.get_size();
            const cells = gameboard.get_cells();
            const corner_indexes = [0,number_rows-1];
            const corners = cells.filter(([row_index,column_index]) => corner_indexes.includes(row_index) && corner_indexes.includes(column_index));
            const others = gameboard.get_cells().filter(([row_index,column_index]) => !corner_indexes.includes(row_index) || !corner_indexes.includes(column_index));
            const opportunities = [];
            let count = 0;
            let must_be_corner = false;
            let must_be_other = false;
            corners.forEach(([row_index,column_index]) => {
                if (gameboard.get_side(row_index,column_index) === opponent_side) count++;
            })
            if (count === 2) must_be_other = true;
            const mid_approx = Math.floor(number_rows/2);
            if (count === 1 && gameboard.get_side(mid_approx,mid_approx) === opponent_side) must_be_corner = true;
            outer: for (const line of lines){
                let computer_signs = 0;
                let free_indexes = [];
                for (const [row_index,column_index] of line){
                    if (gameboard.get_side(row_index,column_index) === opponent_side) continue outer;
                    if (gameboard.get_side(row_index,column_index) === computer_player.side) computer_signs++;
                    if (gameboard.get_side(row_index,column_index) === null){
                        if (must_be_corner){
                            if (corners.find((elem) => is_equal([row_index,column_index],elem))) free_indexes.push([row_index,column_index])
                        }
                        else if (must_be_other){
                            if (others.find((elem) => is_equal([row_index,column_index],elem))) free_indexes.push([row_index,column_index])
                        }
                        else {
                            free_indexes.push([row_index,column_index]);
                        }
                    }
                }
                if (computer_signs === number_rows - 2 && free_indexes.length !== 0){
                    opportunities.push(...free_indexes);
                }
            }
            if (opportunities.length > 0) return random_choose(opportunities);
            return null;
        }
        function make_move(gameboard,opponent_side){
            const cell_indexes = computer_modes[this.difficulty](gameboard,opponent_side);
            if (cell_indexes !== null){
                return cell_indexes;
            }
            return null;
        }
        computer_player.make_move = make_move;
        return computer_player;
    }

function GameBoard(number_rows){
    if (number_rows < 1 || !Number.isInteger(number_rows)) throw new Error("Invalid number")
    const cells = [];
    const rows = [];
    const columns = [];
    const diagonales = [];
    function Cell(i,j){
        if (!new.target) throw new Error("MUST BE CALLED WITH NEW");
        this.row_index = i;
        this.column_index = j;
        this.info = null;
    }
    function Line(...rest){
        if (!new.target) throw new Error("MUST BE CALLED WITH NEW");
        this.cells = [...rest];
    }
    Line.prototype.contains = function(cell){
        return this.cells.includes(cell);
    }
    for (let i = 0; i < number_rows; i++){
        for (let j = 0; j < number_rows; j++){
            cells.push(new Cell(i,j));
        }
    }
    function get_size(){
        return number_rows;
    }
    function get_element(row_index, column_index){
        if (!Number.isInteger(row_index) || !Number.isInteger(column_index) || row_index >= number_rows || column_index >= number_rows || row_index < 0 || column_index < 0) throw new Error("Invalid index");
        return cells[row_index * number_rows + column_index];
    }
    function set_side(row_index,column_index,side){
        const cell = get_element(row_index,column_index)
        if (cell.info === null){
            cell.info = side;
            return true;
        }else{
            return false
        }
    }
    function get_side(row_index,column_index){
        const cell = get_element(row_index,column_index);
        return cell.info;
    }
    function get_free_cells(array){
        return array.filter(([i,j]) => get_side(i,j) === null)
    }
    function reset(){
        cells.forEach((cell) => cell.info = null);
    }
    (() => {
        const main_diag = [];
        const anti_diag = [];
        for (let i = 0; i < number_rows; i++){
        const row = [];
        const column = [];
        for (let j = 0; j < number_rows; j++){
            row.push(get_element(i,j));
            column.push(get_element(j,i));
        }
        rows.push(new Line(...row));
        columns.push(new Line(...column));
        main_diag.push(get_element(i,i));
        anti_diag.push(get_element(i,number_rows-1-i));
    }
    diagonales.push(new Line(...main_diag),new Line(...anti_diag));
    })();
    const lines = [...rows,...columns,...diagonales];
    function checkForWinning(side){
        const wins = []
        for (const line of lines){
            if (line.cells.every((cell) => cell.info === side)) wins.push(Array.from(line.cells,(cell) => [cell.row_index,cell.column_index]));
        }
        return wins;
    }
    function checkForTie(){
        return cells.every((cell) => cell.info !== null);
    }
    function get_lines(){
        return lines.map((line) => Array.from(line.cells,(cell) => [cell.row_index,cell.column_index]));
    }
    function get_cells(){
        return cells.map((cell) => [cell.row_index,cell.column_index])
    }
    function get_rows(){
        return rows.map((line) => Array.from(line.cells,(cell) => [cell.row_index,cell.column_index]));
    }
    function get_diagonales(){
        return diagonales.map((line) => Array.from(line.cells,(cell) => [cell.row_index,cell.column_index]));
    }
    function get_columns(){
        return columns.map((line) => Array.from(line.cells,(cell) => [cell.row_index,cell.column_index]));
    }
    return {set_side,checkForWinning,checkForTie,reset,get_side,get_size,
        get_lines,get_free_cells,get_cells,get_rows,get_diagonales,get_columns};
}
function Grid(number_rows,grid_dom){
    const cells = [];
    function unlock_grid(){
        grid_dom.classList.remove("is-hazed");
    }
    function lock_grid(){
        grid_dom.classList.add("is-hazed");
    }
    function reset_grid(){
        grid_dom.classList.add("is-hazed");
        for (let i = 0; i < number_rows; i++){
            for (let j = 0; j < number_rows; j++){
                cells[i][j].remove();
            }
        }
        cells.length = 0;
        populateGrid();
    }
    function populateGrid(){
        for (let i = 0; i < number_rows; i++){
            const row = [];
            for (let j = 0; j < number_rows; j++){
                const cell = document.createElement("button"); /*This is for accessability */
                cell.classList.add("grate__cell");
                row.push(cell);
                grid_dom.appendChild(cell);
            }
            cells.push(row);
        }
    }
    function find_indexes(cell){
        for (let i = 0; i < number_rows; i++){
            for (let j = 0 ; j < number_rows; j++){
                if (cells[i][j] === cell) return [i,j];
            }
        }
    }
    function find_cell(row_index,column_index){
        return cells[row_index][column_index];
    }
    function place_mark(cell,side){
        const image = document.createElement("img");
        image.classList.add("grate__cell__image");
        image.alt = side === "noughts" ? "nought" : "cross";
        image.src = images[side];
        cell.appendChild(image);
        cell.classList.add("is-occupied")
    }
    populateGrid();
    return {reset_grid,find_indexes,find_cell,place_mark,unlock_grid,lock_grid}
}
function GameController(gameBoard,Grid,player1,player2,player_turn){
    let total_games = 0;
    let wins_player1 = 0;
    let loses_player1 = 0;
    let wins_player2 = 0;
    let loses_player2 = 0;
    let game_over = false;
    let string = null;
    const player_turn_conservated = player_turn;
    const place_mark = Grid.place_mark;
    function GameEnd(first = true){
        if (game_over) return string;
        if (gameBoard.checkForWinning(player1.side).length > 0){
            game_over = true;
            wins_player1 += 1;
            loses_player2+=1;
            player1.update_wins();
            player2.update_loses();
            string = first ? "win" : "lose";
        }
        else if (gameBoard.checkForWinning(player2.side).length > 0){
            game_over = true;
            wins_player2 += 1;
            loses_player1 += 1;
            player1.update_loses();
            player2.update_wins();
            string = first ? "lose" : "win";
        }
        else if (gameBoard.checkForTie()){
            game_over = true;
            player1.update_ties();
            player2.update_ties();
            string = "tie";
        }
        if (game_over){
            total_games++;
            return string;
        }
        return null;
    }
    /* These are intermidiate ones */
    function update_stats(game_end_message_title,game_end_message_body){
        game_end_message_title.textContent = "Intermidiate stats";
        game_end_message_body.textContent = `Game totals ${total_games}. Player1 stats -  Wins: ${wins_player1}, Loses: ${loses_player1}. Player2 stats -  Wins: ${wins_player2}, Loses: ${loses_player2}.`
    }
    function show_game_message(string,player,game_end_message,game_end_message_title,game_end_message_body){
        if (string === null) return;
        if (string === "win"){
            game_end_message_title.textContent = "IT IS A WIN"
            game_end_message_body.textContent = `You won. Congratulations ${player.title} ${player.name}!`
        }
        else if (string === "lose"){
            string = "lose"
            game_end_message_title.textContent = "IT IS A LOSE"
            game_end_message_body.textContent = `You lost, ${player.title} ${player.name}. You better train next time!`
        }
        else if (string === "tie"){
            string = "tie";
            game_end_message_title.textContent = "IT IS A TIE"
            game_end_message_body.textContent = `This was tough fight. No one wins here! Even ${player.title} ${player.name}`
        }
        game_end_message.showModal();
        Grid.lock_grid();
    }
    function get_player_turn(){
        return player_turn;
    }
    function reset(){
        game_over = false;
        string = null;
        player_turn = player_turn_conservated;
        gameBoard.reset();
        Grid.reset_grid();
    }
    function get_total_games(){
        return total_games;
    }
    function get_player1_stats(){
        return [wins_player1,loses_player1];
    }
    function get_player2_stats(){
        return [wins_player2,loses_player2];
    }
    function make_move(row_index,column_index){
        if (game_over) return false;
        let side;
        if (player_turn) {
            side = player1.side
        }
        else {
            side = player2.side
        };
        if (!gameBoard.set_side(row_index,column_index,side)) return false;
        const cell = Grid.find_cell(row_index,column_index);
        place_mark(cell,side);
        player_turn = !player_turn;
        GameEnd();
        return true;
    }
    function find_indexes(cell){
        return Grid.find_indexes(cell);
    }
    function get_gameBoard(){
        return gameBoard;
    }
    function get_Grid(){
        return Grid;
    }
    function get_players(){
        return [player1,player2];
    }
    function get_game_ended(){
        return game_over;
    }
    return {get_total_games,get_player1_stats,get_player2_stats,make_move,GameEnd,
        update_stats,reset,find_indexes,show_game_message,get_gameBoard,get_Grid,
        get_game_ended,get_players,get_player_turn}
}
const images = {
    "noughts": "images/zero.svg",
    "crosses": "images/cross.svg"
};
(() => {
    game_grid.addEventListener("click",(e) => {
    if (game_grid.classList.contains("is-hazed")){
        if (gamecontroller === null){
            choose_opponent_dialog.showModal();
        }else{
            update_stats(player1,gamecontroller.GameEnd());
            player1.update_title();
            opponent_player.update_title();
            player_turn = gamecontroller.get_player_turn();
            document.documentElement.style.setProperty("--bhs-image-to-show",`url(${images[player_turn ? player1.side : opponent_player.side]})`)
            gamecontroller.reset();
            gamecontroller.get_Grid().unlock_grid();
            if (opponent_player.name === "computer" && !player_turn){
            gamecontroller.make_move(...opponent_player.make_move(gamecontroller.get_gameBoard(),player1.side))
            }
        }
        return;
    }
    if (e.target === game_grid) return;
    const cell_selected = e.target.closest(".grate__cell");
    if (cell_selected === null) return;
    const cell_selected_indexes = grid.find_indexes(cell_selected);
    const human_move_success = gamecontroller.make_move(...cell_selected_indexes);
    if (!human_move_success) return;
    if (opponent_player.name === "computer"){
        if (!gamecontroller.get_game_ended()) gamecontroller.make_move(...opponent_player.make_move(gamecontroller.get_gameBoard(),player1.side));
    }else{
        player_turn = gamecontroller.get_player_turn();
        document.documentElement.style.setProperty("--bhs-image-to-show",`url(${images[player_turn ? player1.side : opponent_player.side]})`)
    }
    gamecontroller.show_game_message(gamecontroller.GameEnd(),player1,game_end_message,game_end_message_title,game_end_message_body);
})
choose_side_dialog.addEventListener("click",(e) => {
    e.stopPropagation();
    if (e.target.closest(".button--close")){
        choose_side_dialog.close();
        return;
    }
    if (e.target.classList.contains("button")){
        player1.side = e.target.dataset.side.toLowerCase();
        opponent_player.side = player1.side === "noughts" ? "crosses" : "noughts";
        player_turn = player1.side === "noughts";
        choose_side_dialog.close();
        grid.unlock_grid();
        gamecontroller = GameController(gameboard,grid,player1,opponent_player,player_turn);
        if (opponent_player.name === "computer" && !player_turn){
            gamecontroller.make_move(...opponent_player.make_move(gamecontroller.get_gameBoard(),player1.side));
            player_turn = gamecontroller.get_player_turn();
        }
        document.documentElement.style.setProperty("--bhs-image-to-show",`url(${images[player_turn ? player1.side : opponent_player.side]})`)
    }
})
choose_opponent_dialog.addEventListener("click",(e)=>{
     e.stopPropagation();
     if (e.target.closest(".button--close")){
        choose_opponent_dialog.close();
        return;
    }
    if (e.target.classList.contains("button")){
        player_opponent = e.target.dataset.opponent.toLowerCase();
        if (player_opponent === "computer"){
            opponent_player = player3;
            choose_ai_difficulty.showModal();
        }else{
            opponent_player = player2;
            choose_side_dialog.showModal();
        }
        choose_opponent_dialog.close();
    }
})
choose_ai_difficulty.addEventListener("click",(e) => {
    e.stopPropagation();
    if (e.target.closest(".button--close")){
        choose_ai_difficulty.close();
        return;
    }
    if (e.target.classList.contains("button")){
        player3.difficulty = e.target.dataset.difficulty.toLowerCase();
        choose_ai_difficulty.close();
        choose_side_dialog.showModal();
    }
})
stats_button.addEventListener("click",(e)=>{
    stats.classList.toggle("is-open");
    stats_button.ariaExpanded = stats_button.ariaExpanded === "false";
})
user_name_option.addEventListener("click",(e)=>{
    user_name_dialog.showModal();
})
user_name_dialog.addEventListener("click",(e)=>{
    if (e.target.closest(".button--close")){
        user_name_dialog.close();
    }
})
user_name_form.addEventListener("submit",(e)=>{
    e.preventDefault();
    user_name_option.textContent = input_username.value.trim();
    player1.update_name(user_name_option.textContent);
    user_name_dialog.close();
})
wins_option.addEventListener("click",(e)=>{
    wins_dialog.showModal();
})
wins_dialog.addEventListener("click",(e)=>{
    if (e.target.closest(".button--close")){
        wins_dialog.close();
    }
})
loses_option.addEventListener("click",(e)=>{
    loses_dialog.showModal();
})
loses_dialog.addEventListener("click",(e)=>{
    if (e.target.closest(".button--close")){
        loses_dialog.close();
    }
})
ties_option.addEventListener("click",(e)=>{
    ties_dialog.showModal();
})
ties_dialog.addEventListener("click",(e)=>{
    if (e.target.closest(".button--close")){
        ties_dialog.close();
    }
})
data_history_option.addEventListener("click",(e)=>{
    data_history_dialog.showModal();
})
data_history_dialog.addEventListener("click",(e)=>{
    if (e.target.closest(".button--close")){
        data_history_dialog.close();
    }
})
game_end_message.addEventListener("click",(e)=>{
    e.stopPropagation();
    if (e.target.closest(".button--close")){
        game_end_message.close();
    }
})
data_reset_grid.addEventListener("click",(e)=>{
    update_stats(player1,gamecontroller.GameEnd());
    player1.update_title();
    opponent_player.update_title();
    game_grid.classList.add("is-hazed");
    gamecontroller?.reset();
    gamecontroller = null;
});
})();
const gameboard = GameBoard(3);
const grid = Grid(3,game_grid);
let player1 = new Player(user_name_option.textContent,null);
let player2 = new Player("admin",null); /* For now */
let player3 = computer();
let opponent_player = null;
let gamecontroller = null;
let player_turn = true;