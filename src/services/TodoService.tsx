import {useEffect, useState} from "react";
import {TiDeleteOutline, TiPencil, TiDocumentAdd} from "react-icons/ti";

type todo = {
	id: number;
	createdAt: Date;
	updatedAt: Date;
	task: string;
	isDone: boolean;
	categoryId: number;
};

export default function TodoService(props: {categoryId: number}) {
	const [error, setError] = useState(null);
	const [items, setItems] = useState<todo[]>([]);
	const [todoInput, setTodoInput] = useState("");

	useEffect(() => {
		let path = "";
		switch (true) {
			case props.categoryId === 0:
				path = "http://localhost:3005/todo";
				break;
			case props.categoryId > 0:
				path = `http://localhost:3005/category/${props.categoryId}/todo`;
				break;
			default:
				setItems([]);
				return;
		}

		// fetch(`http://localhost:3005/todo/${props.categoryId ? props.categoryId : ""}`)
		fetch(path)
			.then((res) => res.json())
			.then(
				(result) => setItems(result),
				(error) => {
					setError(error);
				},
			);
	}, [props.categoryId]);

	function addTodo() {
		// const todoToAdd = todoInput.trim();
		if (props.categoryId <= 0 || !todoInput.trim()) {
			// console.log("Do NOT show todo input");
			return;
		}

		const newTodo = {
			task: todoInput.trim(),
			categoryId: props.categoryId,
		};

		// console.log("todo to add:", newTodo);

		fetch(`http://localhost:3005/todo`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newTodo), // body data type must match "Content-Type" header
		})
			.then((res) => res.json())
			.then((result) => {
				// If error obj
				if (result.hasOwnProperty("code")) return;

				let arr = items;
				arr.push(result);
				setItems(arr);
				setTodoInput("");
			});
	}

	function updateTodo(idTobeUpdated: number) {
		// console.log("todo to be update:", idTobeUpdated);
		const currentTask = items.filter((x) => x.id === idTobeUpdated)[0].task;
		const newTask = window.prompt("Update", currentTask)?.trim();

		if (newTask !== undefined && newTask?.length > 0 && newTask !== currentTask) {
			console.log(newTask);

			const newTodo = {
				task: newTask,
			};
			fetch(`http://localhost:3005/todo/${idTobeUpdated}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newTodo), // body data type must match "Content-Type" header
			})
				.then((res) => res.json())
				.then((result) => {
					// If error obj
					if (result.hasOwnProperty("code")) return;

					const indexToUpdate = items.indexOf(items.filter((x) => x.id === idTobeUpdated)[0]);
					const arr = JSON.parse(JSON.stringify(items)); // https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
					arr[indexToUpdate].task = result.task;
					// console.log("::", arr[indexToUpdate]);
					// console.log(":::", items[indexToUpdate]);

					setItems(arr);
				});
		} else {
			console.log("Nothing to update");
		}
	}

	function setTaskDone(idTobeUpdated: number, done: boolean) {
		console.log("Task id", idTobeUpdated, "is done", done);

		const newTodo = {
			isDone: !done,
		};

		fetch(`http://localhost:3005/todo/${idTobeUpdated}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newTodo), // body data type must match "Content-Type" header
		})
			.then((res) => res.json())
			.then((result) => {
				console.log(result);

				// If error obj
				if (result.hasOwnProperty("code")) return;

				const indexToUpdate = items.indexOf(items.filter((x) => x.id === idTobeUpdated)[0]);
				const arr = JSON.parse(JSON.stringify(items)); // https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
				arr[indexToUpdate].isDone = result.isDone;
				// console.log("::", arr[indexToUpdate]);
				// console.log(":::", items[indexToUpdate]);

				setItems(arr);
			});
	}

	function deleteTodo(idTobeDelete: number) {
		// console.log("todo to be deleted:", idTobeDelete);
		if (window.confirm("Sure ?")) {
			fetch(`http://localhost:3005/todo/${idTobeDelete}`, {
				method: "DELETE",
			})
				.then((res) => res.json())
				.then((result) => {
					// Remove deleted item from items
					setItems(items.filter((x) => x.id !== result.id));
				});
		}
	}

	if (error) {
		return <div>Error: {JSON.stringify(error)}</div>;
	} else {
		return (
			<section className="todoContainer">
				<section className="taskSection">
					{items.map((item) => (
						<article className="todoItem" key={item.id} style={{display: "flex", gap: "10px"}}>
							<div className="todoTask">
								<p
									className={item.isDone ? "taskDone" : ""}
									onClick={() => {
										setTaskDone(item.id, item.isDone);
									}}
								>
									{item.task}
								</p>
							</div>

							<div className="todoBttnBox">
								<button className="todoBttn todoBttnDelete" type="button" onClick={() => deleteTodo(item.id)}>
									<TiDeleteOutline />
								</button>
								<button className="todoBttn" type="button" onClick={() => updateTodo(item.id)}>
									<TiPencil />
								</button>
							</div>
						</article>
					))}
				</section>

				{props.categoryId > 0 && (
					<div className="todoInput">
						<input
							type="text"
							onChange={(e) => setTodoInput(e.target.value)}
							onKeyUp={(e) => {
								if (e.key === "Enter") {
									addTodo();
								} else if (e.key === "Escape") {
									setTodoInput("");
								}
							}}
							value={todoInput}
							placeholder="New Task"
							required
						/>
						<button type="button" onClick={addTodo}>
							<TiDocumentAdd />
						</button>
						<button
							type="button"
							onClick={() => {
								setTodoInput("");
							}}
						>
							<TiDeleteOutline />
						</button>
					</div>
				)}
			</section>
		);
	}
}
