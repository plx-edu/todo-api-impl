import React, {useState} from "react";
import "./App.css";
import CategoryService from "./services/CategoryService";
import TodoService from "./services/TodoService";

function App() {
	const [categoryId, setCategoryId] = useState(-1);

	function getCategory(value: number) {
		setCategoryId(value);
	}

	return (
		<div className="App">
			<section className="mainSection">
				{/* <h4>To Do</h4> */}
				<CategoryService categoryChange={getCategory} />
				<TodoService categoryId={categoryId} />
			</section>
		</div>
	);
}

export default App;
