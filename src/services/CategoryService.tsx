import React, {useEffect, useState} from "react";
import {TiDeleteOutline, TiDelete, TiPlusOutline, TiMinusOutline, TiDocumentAdd} from "react-icons/ti";

type category = {
	id: number;
	name: string;
};

export default function CategoryService(props: {categoryChange: Function}) {
	const [selectedCategory, setSelectedCategory] = useState(-1);
	const [error, setError] = useState(null);
	const [items, setItems] = useState<category[]>([]);
	const [categoryInput, setCategoryInput] = useState("");
	const [showInput, setShowInput] = useState(false);

	useEffect(() => {
		fetch(`http://localhost:3005/category`)
			.then((res) => res.json())
			.then(
				(result) => {
					setItems(result);
				},
				(error) => {
					setError(error);
				},
			);
	}, []);

	function showCategoryInput() {
		setShowInput(!showInput);
	}
	function getCategory(e: React.ChangeEvent<HTMLSelectElement>) {
		const value = +e.target.value;
		setSelectedCategory(value);
		props.categoryChange(value);
	}

	function addCategory() {
		// console.log(categoryInput);
		if (!categoryInput.trim()) {
			console.log("Nothing to add");
			return;
		}

		const newCategory = {
			name: categoryInput.trim(),
		};
		setShowInput(false);

		fetch(`http://localhost:3005/category`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newCategory), // body data type must match "Content-Type" header
		})
			.then((res) => res.json())
			.then((result) => {
				// If error obj
				if (result.hasOwnProperty("code")) return;

				let arr = items;
				arr.push(result);
				setItems(arr);
				setCategoryInput(""); // Also hide input ?
				props.categoryChange(result.id);
				setSelectedCategory(result.id);
			});
	}

	function deleteCategory() {
		if (selectedCategory <= 0) {
			console.log("Nothing to delete");
			return;
		}

		fetch(`http://localhost:3005/category/${selectedCategory}`, {
			method: "DELETE",
		})
			.then((res) => res.json())
			.then((result) => {
				// Remove deleted item from items
				setItems(items.filter((x) => x.id !== result.id));

				setSelectedCategory(-1);
				props.categoryChange(-1);
			});
	}

	if (error) {
		return <section>Error: {JSON.stringify(error)}</section>;
	} else {
		return (
			<section className="categoryContainer">
				<div className="categorySelectBox">
					{/* <select onChange={(e) => props.select(+e.target.value)}> */}
					<select className="categorySelect" onChange={getCategory} value={selectedCategory}>
						<option value="-1">-- Select Category --</option>
						<option value="0">All</option>
						{items.map((item) => (
							<option key={item.id} value={item.id}>
								{item.name}
							</option>
						))}
					</select>
					<button type="button" onClick={showCategoryInput}>
						{!showInput && <TiPlusOutline />}
						{showInput && <TiMinusOutline />}
					</button>

					{selectedCategory > 0 && (
						<button type="button" onClick={deleteCategory}>
							<TiDelete />
						</button>
					)}
				</div>

				{showInput && (
					<div className="categoryInput">
						<input
							type="text"
							onChange={(e) => setCategoryInput(e.target.value)}
							onKeyUp={(e) => {
								if (e.key === "Enter") {
									addCategory();
								} else if (e.key === "Escape") {
									setCategoryInput("");
								}
							}}
							value={categoryInput}
							placeholder="New Category"
							required
						/>
						<button type="button" onClick={addCategory}>
							<TiDocumentAdd />
						</button>
						<button
							type="button"
							onClick={() => {
								setCategoryInput("");
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
